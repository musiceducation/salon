"use client";

import { useEffect } from "react";
import type { ShopCheckoutCopy } from "@/lib/shop-checkout-copy";

type Product = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
};

export function ShopCartDrawer({
  open,
  product,
  quantity,
  locale,
  subtotalLabel,
  t,
  isStaticSite,
  onClose,
  onCheckout,
  onQuantityChange,
}: {
  open: boolean;
  product: Product | undefined;
  quantity: number;
  locale: string;
  subtotalLabel: string;
  t: ShopCheckoutCopy;
  isStaticSite: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onQuantityChange: (n: number) => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const title = product ? (locale === "zh-HK" ? product.nameZh : product.nameEn) : "";

  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t.shopClose}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-cart-title"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
          <h2 id="shop-cart-title" className="text-base font-semibold text-neutral-900">
            {t.shopCartTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
            aria-label={t.shopClose}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {product ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
              <p className="text-sm font-medium text-neutral-900">{title}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  {t.shopQuantityLabel}
                  <select
                    value={quantity}
                    onChange={(e) => onQuantityChange(Number(e.target.value))}
                    className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-sm font-semibold text-neutral-900">{subtotalLabel}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">{t.shopCartEmpty}</p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-neutral-500">{t.shopPaymentHintLocal}</p>
          <p className="mt-2 text-xs text-neutral-500">{t.shopInSalonPickup}</p>
        </div>

        <div className="border-t border-neutral-200 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-neutral-600">{t.shopCartSubtotal}</span>
            <span className="font-semibold text-neutral-900">{subtotalLabel}</span>
          </div>
          <button
            type="button"
            disabled={!product}
            onClick={onCheckout}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {isStaticSite ? t.shopWhatsappOrder : t.shopCartCheckout}
          </button>
        </div>
      </aside>
    </div>
  );
}
