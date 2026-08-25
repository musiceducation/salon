"use client";

import { FormEvent, useEffect, useState } from "react";
import { copyTextToClipboard } from "@/lib/contact-wechat";
import { phoneToE164 } from "@/lib/tel-href";
import {
  BOOKING_SERVICE_SHEET,
  fallbackSheetOrderId,
  queueSpreadsheetSync,
} from "@/lib/spreadsheet-sync";

type Slot = {
  id: string;
  label: string;
};

type BookingFormProps = {
  locale: string;
  initialSlots: Slot[];
  defaultServiceId: string;
  /** Shown when there are no bookable slots (e.g. DB empty or all full). */
  noSlotsHint: string;
  wechatId: string;
  phoneDisplay: string;
  phoneTelHref: string;
  staticNote: string;
  staticCta: string;
  staticCopied: string;
};

const services = [
  { id: "haircut", labelZh: "洗剪造型", labelEn: "Haircut" },
  { id: "color", labelZh: "染髮", labelEn: "Color" },
  { id: "perm", labelZh: "燙髮", labelEn: "Perm" },
];

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `idemp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

/** Local Macau display digits (drop leading 853 when present). */
function localPhoneDigits(phone: string) {
  const d = digitsOnly(phone);
  if (d.startsWith("853") && d.length > 8) {
    return d.slice(3);
  }
  return d;
}

function isValidPhoneDigits(phone: string) {
  const d = digitsOnly(phone);
  return d.length >= 6 && d.length <= 15;
}

function serviceLabel(serviceId: string, locale: string) {
  const svc = services.find((s) => s.id === serviceId);
  if (!svc) return serviceId;
  return locale === "zh-HK" ? svc.labelZh : svc.labelEn;
}

export function BookingForm({
  locale,
  initialSlots,
  defaultServiceId,
  noSlotsHint,
  wechatId,
  phoneDisplay,
  phoneTelHref,
  staticNote,
  staticCta,
  staticCopied,
}: BookingFormProps) {
  const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
  const [selectedService, setSelectedService] = useState(defaultServiceId);
  const [selectedSlot, setSelectedSlot] = useState(initialSlots[0]?.id ?? "");
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  useEffect(() => {
    if (isStaticSite) {
      return;
    }

    async function loadSlots() {
      try {
        const response = await fetch(
          `/api/booking/slots?service=${encodeURIComponent(selectedService)}&locale=${encodeURIComponent(locale)}`,
        );
        if (!response.ok) {
          setMessage(
            locale === "zh-HK"
              ? "無法載入時段，請稍後再試，或致電／WeChat 預約。"
              : "Could not load time slots. Please try again later, or book by phone / WeChat.",
          );
          setSlots([]);
          setSelectedSlot("");
          return;
        }
        const raw = await response.text();
        let data: { slots: Slot[] };
        try {
          data = raw ? (JSON.parse(raw) as { slots: Slot[] }) : { slots: [] };
        } catch {
          setMessage(
            locale === "zh-HK"
              ? "無法載入時段，請稍後再試，或致電／WeChat 預約。"
              : "Could not load time slots. Please try again later, or book by phone / WeChat.",
          );
          setSlots([]);
          setSelectedSlot("");
          return;
        }
        setSlots(data.slots);
        setSelectedSlot(data.slots[0]?.id ?? "");
        setMessage("");
      } catch {
        setMessage(
          locale === "zh-HK"
            ? "無法載入時段（網絡或伺服器問題）。請稍後再試。"
            : "Could not load time slots (network or server). Please try again.",
        );
        setSlots([]);
        setSelectedSlot("");
      }
    }
    void loadSlots();
  }, [selectedService, locale, isStaticSite]);

  async function copyStaticBookingRequest() {
    if (!isValidPhoneDigits(phone) || name.trim().length < 2) {
      setMessage(
        locale === "zh-HK"
          ? "請先填寫姓名與有效聯絡電話。"
          : "Please enter your name and a valid phone number first.",
      );
      return;
    }

    const lines = [
      locale === "zh-HK" ? "【藝能預約】" : "[n_nsalon booking]",
      `${locale === "zh-HK" ? "姓名" : "Name"}: ${name.trim()}`,
      `${locale === "zh-HK" ? "電話" : "Phone"}: ${digitsOnly(phone)}`,
      `${locale === "zh-HK" ? "服務" : "Service"}: ${serviceLabel(selectedService, locale)}`,
      preferredTime.trim()
        ? `${locale === "zh-HK" ? "希望時段" : "Preferred time"}: ${preferredTime.trim()}`
        : null,
    ].filter(Boolean);

    const text = lines.join("\n");
    const copied = await copyTextToClipboard(text);
    const sheetService = BOOKING_SERVICE_SHEET[selectedService];
    queueSpreadsheetSync({
      orderId: fallbackSheetOrderId("BK"),
      bookingDate: preferredTime.trim(),
      customerName: name.trim(),
      phone: digitsOnly(phone),
      service: sheetService?.nameZh ?? serviceLabel(selectedService, "zh-HK"),
      amount: sheetService?.amount ?? 0,
      paymentMethod: "現金",
      paymentStatus: "待付款",
      remark: "網站預約（靜態頁）",
    });
    setMessage(copied ? staticCopied.replace("{wechat}", wechatId) : text);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isStaticSite) {
      await copyStaticBookingRequest();
      return;
    }

    if (!isValidPhoneDigits(phone)) {
      setMessage(
        locale === "zh-HK"
          ? "請輸入有效聯絡電話（6–15 位數字，可含空格或 +853）。"
          : "Please enter a valid phone number (6–15 digits; spaces or + country code are OK).",
      );
      return;
    }

    if (!selectedSlot) {
      setMessage(noSlotsHint);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          locale,
          serviceId: selectedService,
          slotId: selectedSlot,
          customerName: name.trim(),
          customerPhone: digitsOnly(phone),
        }),
      });

      const raw = await response.text();
      let data: { message: string };
      try {
        data = raw ? (JSON.parse(raw) as { message: string }) : { message: "Unknown error." };
      } catch {
        data = { message: raw.slice(0, 200) || "Invalid response from server." };
      }
      setMessage(data.message);
      if (response.ok) {
        setIdempotencyKey(createIdempotencyKey());
        setName("");
        setPhone("");
        // Refresh slots so the booked one disappears when capacity is gone.
        const refresh = await fetch(
          `/api/booking/slots?service=${encodeURIComponent(selectedService)}&locale=${encodeURIComponent(locale)}`,
        );
        if (refresh.ok) {
          const refreshRaw = await refresh.text();
          try {
            const refreshData = refreshRaw
              ? (JSON.parse(refreshRaw) as { slots: Slot[] })
              : { slots: [] };
            setSlots(refreshData.slots);
            setSelectedSlot(refreshData.slots[0]?.id ?? "");
          } catch {
            /* keep current slots */
          }
        }
      }
    } catch {
      setMessage(
        locale === "zh-HK"
          ? "無法提交預約，請檢查網絡後再試。"
          : "Could not submit booking. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmitApi = Boolean(selectedSlot) && !isSubmitting;
  const canSubmitStatic = name.trim().length >= 2 && isValidPhoneDigits(phone) && !isSubmitting;

  return (
    <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <p className="md:col-span-2 text-sm text-zinc-400">
        {isStaticSite
          ? staticNote
          : locale === "zh-HK"
            ? "提交後我們會盡快以電話或訊息確認。若該時段額滿，請改選其他時間。"
            : "We will confirm by phone or message. If a slot is full, please pick another time."}
      </p>
      <label className="flex flex-col gap-2 text-sm">
        <span>{locale === "zh-HK" ? "服務" : "Service"}</span>
        <select
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          value={selectedService}
          onChange={(event) => setSelectedService(event.target.value)}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {locale === "zh-HK" ? `${service.labelZh} / ${service.labelEn}` : `${service.labelEn} / ${service.labelZh}`}
            </option>
          ))}
        </select>
      </label>
      {isStaticSite ? (
        <label className="flex flex-col gap-2 text-sm">
          <span>{locale === "zh-HK" ? "希望時段（可選）" : "Preferred time (optional)"}</span>
          <input
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            placeholder={locale === "zh-HK" ? "例：本週六下午" : "e.g. Saturday afternoon"}
          />
        </label>
      ) : (
        <label className="flex flex-col gap-2 text-sm">
          <span>{locale === "zh-HK" ? "時段" : "Time slot"}</span>
          <select
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            aria-invalid={slots.length === 0}
          >
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
          {slots.length === 0 ? (
            <p className="text-sm leading-relaxed text-amber-200/90" role="status">
              {noSlotsHint}
            </p>
          ) : null}
        </label>
      )}
      <label className="flex flex-col gap-2 text-sm">
        <span>{locale === "zh-HK" ? "姓名" : "Name"}</span>
        <input
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>{locale === "zh-HK" ? "電話" : "Phone"}</span>
        <input
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder={locale === "zh-HK" ? "例：28304175 或 6xxxxxxx" : "e.g. 28304175 or +853 …"}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          className="inline-flex w-fit rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          type="submit"
          disabled={isStaticSite ? !canSubmitStatic : !canSubmitApi}
        >
          {isSubmitting
            ? locale === "zh-HK"
              ? "提交中…"
              : "Submitting…"
            : isStaticSite
              ? staticCta
              : locale === "zh-HK"
                ? "確認預約"
                : "Confirm booking"}
        </button>
        <p className="text-sm text-zinc-400">
          {locale === "zh-HK" ? "致電 " : "Call "}
          <a className="text-emerald-300/90 underline-offset-2 hover:underline" href={phoneTelHref}>
            {localPhoneDigits(phoneDisplay) || phoneDisplay}
          </a>
          <span aria-hidden="true">/</span>
          <a
            className="text-emerald-300/90 underline-offset-2 hover:underline"
            href={`tel:${phoneToE164(wechatId)}`}
          >
            {localPhoneDigits(wechatId) || wechatId}
          </a>
        </p>
      </div>
      {message ? <p className="text-sm text-zinc-300 md:col-span-2">{message}</p> : null}
    </form>
  );
}
