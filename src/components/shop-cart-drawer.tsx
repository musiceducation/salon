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
        className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#141311] text-stone-100 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <h2 id="shop-cart-title" className="text-sm tracking-[0.22em] text-stone-200">
            {t.shopCartTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-stone-400 transition hover:text-white"
            aria-label={t.shopClose}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {product ? (
            <div className="flex gap-4 border-t border-white/10 pt-5">
              <div className="showroom-bay relative h-24 w-20 shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={publicAssetPath(product.imageUrl)}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-stone-100">{title}</p>
                {size ? (
                  <p className="mt-1 text-[11px] tracking-wide text-stone-400">
                    {t.shopSizeLabel} {size}
                  </p>
                ) : null}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    {t.shopQuantityLabel}
                    <select
                      value={quantity}
                      onChange={(e) => onQuantityChange(Number(e.target.value))}
                      className="border border-white/20 bg-transparent px-2 py-1 text-sm text-stone-100 [color-scheme:dark]"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-sm tabular-nums text-stone-100">{subtotalLabel}</p>
                </div>
                {memberNote ? <p className="mt-2 text-[11px] text-stone-400">{memberNote}</p> : null}
              </div>
            </div>
          ) : (
            <p className="border-t border-white/10 pt-5 text-sm text-stone-400">{t.shopCartEmpty}</p>
          )}

          <p className="mt-6 text-[11px] leading-relaxed text-stone-500">{t.shopInSalonPickup}</p>
        </div>

        <div className="border-t border-white/10 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[11px] tracking-[0.2em] text-stone-400">{t.shopCartSubtotal}</span>
            <span className="text-2xl font-light tabular-nums text-stone-50">{subtotalLabel}</span>
          </div>
          <button
            type="button"
            disabled={!product}
            onClick={onCheckout}
            className="flex min-h-12 w-full items-center justify-center border border-stone-200/80 text-sm tracking-wide text-stone-100 transition hover:bg-stone-100 hover:text-zinc-950 disabled:opacity-40"
          >
            {isStaticSite ? t.shopWechatOrder : t.shopCartCheckout}
          </button>
        </div>
      </aside>
    </div>
  );
}
