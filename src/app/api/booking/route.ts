import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withIdempotencyByKey } from "@/lib/idempotency";
import {
  BOOKING_SERVICE_SHEET,
  formatMacauDateTime,
  submitOrderToSpreadsheet,
} from "@/lib/spreadsheet-sync";

type BookingPayload = {
  locale?: string;
  serviceId?: string;
  slotId?: string;
  customerName?: string;
  customerPhone?: string;
};

type BookingSuccessBody = {
  message: string;
  appointmentId: string;
};

const ALLOWED_SERVICES = new Set(["haircut", "color", "perm"]);

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("idempotency-key");
  let body: BookingPayload;
  try {
    body = (await request.json()) as BookingPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await withIdempotencyByKey<BookingSuccessBody | { message: string }>(
    idempotencyKey,
    "booking_create",
    async () => {
      const serviceId = body.serviceId?.trim();
      const slotId = body.slotId?.trim();
      const customerName = body.customerName?.trim();
      const customerPhone = body.customerPhone ? digitsOnly(body.customerPhone) : "";

      if (!serviceId || !slotId || !customerName || !customerPhone) {
        return { status: 400, body: { message: "Missing required fields." } };
      }

      if (!ALLOWED_SERVICES.has(serviceId) || customerName.length < 2) {
        return { status: 400, body: { message: "Invalid booking details." } };
      }

      if (customerPhone.length < 6 || customerPhone.length > 15) {
        return {
          status: 400,
          body: {
            message:
              body.locale === "zh-HK"
                ? "請輸入有效聯絡電話（6–15 位數字）。"
                : "Please enter a valid phone number (6–15 digits).",
          },
        };
      }

      try {
        const created = await prisma.$transaction(async (tx) => {
          const service = await tx.service.findFirst({
            where: { key: serviceId, isActive: true },
            select: { key: true },
          });
          if (!service) {
            throw new Error("SERVICE_NOT_FOUND");
          }

          const existing = await tx.appointment.findFirst({
            where: {
              slotId,
              customerPhone,
              status: { in: ["pending", "confirmed"] },
            },
          });

          if (existing) {
            throw new Error("DUPLICATE_BOOKING");
          }

          const slotUpdate = await tx.availabilitySlot.updateMany({
            where: {
              id: slotId,
              serviceKey: serviceId,
              status: "open",
              remaining: { gt: 0 },
              startsAt: { gte: new Date() },
            },
            data: {
              remaining: { decrement: 1 },
            },
          });

          if (slotUpdate.count !== 1) {
            const slot = await tx.availabilitySlot.findUnique({
              where: { id: slotId },
            });
            if (!slot) {
              throw new Error("SLOT_NOT_FOUND");
            }
            throw new Error("SLOT_UNAVAILABLE");
          }

          const slotAfter = await tx.availabilitySlot.findUnique({
            where: { id: slotId },
            select: { remaining: true },
          });
          if (slotAfter && slotAfter.remaining <= 0) {
            await tx.availabilitySlot.update({
              where: { id: slotId },
              data: { status: "full", remaining: 0 },
            });
          }

          const appointment = await tx.appointment.create({
            data: {
              serviceId,
              slotId,
              customerName,
              customerPhone,
              status: "pending",
            },
          });

          const bookedSlot = await tx.availabilitySlot.findUnique({
            where: { id: slotId },
            select: { startsAt: true },
          });
          const bookedService = await tx.service.findFirst({
            where: { key: serviceId },
            select: { nameZh: true, basePrice: true },
          });

          return {
            appointmentId: appointment.id,
            bookingDate: bookedSlot?.startsAt ?? null,
            serviceNameZh: bookedService?.nameZh ?? BOOKING_SERVICE_SHEET[serviceId]?.nameZh ?? serviceId,
            amount: bookedService?.basePrice ?? BOOKING_SERVICE_SHEET[serviceId]?.amount ?? 0,
          };
        });

        after(() => {
          void submitOrderToSpreadsheet({
            orderId: created.appointmentId,
            bookingDate: formatMacauDateTime(created.bookingDate),
            customerName,
            phone: customerPhone,
            service: created.serviceNameZh,
            amount: created.amount,
            paymentMethod: "現金",
            paymentStatus: "待付款",
            remark: "網站預約",
          });
        });

        const message =
          body.locale === "zh-HK"
            ? "預約已送出，我們會盡快確認。"
            : "Booking submitted. We will confirm shortly.";

        return {
          status: 201,
          body: { message, appointmentId: created.appointmentId },
        };
      } catch (error) {
        if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
          return {
            status: 409,
            body: {
              message:
                body.locale === "zh-HK" ? "此時段已滿，請選擇其他時段。" : "Selected slot is full.",
            },
          };
        }

        if (error instanceof Error && error.message === "SLOT_NOT_FOUND") {
          return {
            status: 404,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "找不到此時段，請重新整理頁面。"
                  : "Slot not found. Please refresh.",
            },
          };
        }

        if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
          return {
            status: 400,
            body: {
              message:
                body.locale === "zh-HK" ? "找不到此服務，請重新選擇。" : "Service not found. Please choose again.",
            },
          };
        }

        if (error instanceof Error && error.message === "DUPLICATE_BOOKING") {
          return {
            status: 409,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "你已預約此時段，請勿重複提交。"
                  : "You already booked this slot.",
            },
          };
        }

        console.error("[booking]", error);
        if (isProduction()) {
          return {
            status: 500,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "系統暫時無法處理預約，請稍後再試。"
                  : "We could not complete your booking. Please try again later.",
            },
          };
        }

        return {
          status: 503,
          body: {
            message:
              "Booking service unavailable (database may not be migrated). Run prisma migrate in development.",
          },
        };
      }
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
