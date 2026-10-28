"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { ShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { publicAssetPath } from "@/lib/public-asset-path";

type Product = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
};

export function ShopCartDrawer({
  open,
  product,
  quantity,
  size = null,
  locale,
  subtotalLabel,
  memberNote = null,
  t,
  isStaticSite,
  onClose,
  onCheckout,
  onQuantityChange,
}: {
  open: boolean;
  product: Product | undefined;
  quantity: number;
  size?: string | null;
  locale: string;
  subtotalLabel: string;
  memberNote?: string | null;
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
        className="absolute inset-0 bg-black/55"
        aria-label={t.shopClose}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-cart-title"
        className="relative flex h-full w-full max-w-md flex-col bg-[#f6f3ec] text-zinc-900 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <h2 id="shop-cart-title" className="text-xs tracking-[0.28em] text-zinc-800">
            {t.shopCartTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-zinc-500 transition hover:text-zinc-900"
            aria-label={t.shopClose}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {product ? (
            <div className="flex gap-4 border-t border-zinc-300/80 pt-5">
              <div className="relative h-20 w-16 shrink-0 bg-[#121214]">
                {product.imageUrl ? (
                  <Image
                    src={publicAssetPath(product.imageUrl)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-zinc-900">{title}</p>
                {size ? (
                  <p className="mt-1 text-[11px] tracking-wide text-zinc-500">
                    {t.shopSizeLabel} {size}
                  </p>
                ) : null}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-zinc-600">
                    {t.shopQuantityLabel}
                    <select
                      value={quantity}
                      onChange={(e) => onQuantityChange(Number(e.target.value))}
                      className="border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-sm tabular-nums text-zinc-900">{subtotalLabel}</p>
                </div>
                {memberNote ? <p className="mt-2 text-[11px] text-zinc-500">{memberNote}</p> : null}
              </div>
            </div>
          ) : (
            <p className="border-t border-zinc-300/80 pt-5 text-sm text-zinc-600">{t.shopCartEmpty}</p>
          )}

          <p className="mt-6 text-[11px] leading-relaxed text-zinc-500">{t.shopInSalonPickup}</p>
        </div>

        <div className="border-t border-zinc-300/80 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[11px] tracking-[0.2em] text-zinc-500">{t.shopCartSubtotal}</span>
            <span className="text-lg font-light tabular-nums text-zinc-900">{subtotalLabel}</span>
          </div>
          <button
            type="button"
            disabled={!product}
            onClick={onCheckout}
            className="flex min-h-12 w-full items-center justify-center bg-zinc-900 text-sm tracking-wide text-[#f6f3ec] transition hover:bg-zinc-800 disabled:opacity-40"
          >
            {isStaticSite ? t.shopWechatOrder : t.shopCartCheckout}
          </button>
        </div>
      </aside>
    </div>
  );
}
