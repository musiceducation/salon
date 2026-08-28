"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { publicAssetPath } from "@/lib/public-asset-path";
import { getProductDetailContent } from "@/lib/shop-product-detail";
import type { ShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { ShopQuantityStepper } from "@/components/shop-quantity-stepper";

type Product = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
};

type CategoryKey = "shampoo" | "conditioner" | "treatment" | "styling" | "uncategorized";

function HoldShineMeter({
  label,
  level,
  max = 5,
}: {
  label: string;
  level: number;
  max?: number;
}) {
  return (
    <p className="text-xs text-neutral-600">
      {label}{" "}
      <span className="font-medium tracking-wider text-neutral-800" aria-hidden>
        {Array.from({ length: max }, (_, i) => (i < level ? "●" : "○")).join("")}
      </span>
      <span className="sr-only">
        {level} / {max}
      </span>
    </p>
  );
}

export function ShopProductDetailPanel({
  product,
  locale,
  category,
  t,
  onClose,
  onAddToCart,
  priceLabel,
  categoryLabel,
}: {
  product: Product;
  locale: string;
  category: CategoryKey;
  t: ShopCheckoutCopy;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
  priceLabel: string;
  categoryLabel: string;
}) {
  const title = locale === "zh-HK" ? product.nameZh : product.nameEn;
  const detail = getProductDetailContent(product.id, category, locale);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
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
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label={t.shopClose}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-pdp-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {categoryLabel}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label={t.shopClose}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain">
          <div className="grid gap-6 p-4 sm:grid-cols-2 sm:p-6">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-50">
              {product.imageUrl ? (
                <Image
                  src={publicAssetPath(product.imageUrl)}
                  alt={title}
                  width={480}
                  height={480}
                  sizes="(max-width: 640px) 90vw, 240px"
                  className="h-full w-full object-contain p-6"
                  priority
                />
              ) : null}
            </div>

            <div className="flex flex-col">
              {detail.salonPick ? (
                <span className="mb-2 w-fit rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {t.shopSalonPick}
                </span>
              ) : null}
              <h2 id="shop-pdp-title" className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                {title}
              </h2>
              <p className="mt-2 text-lg font-medium text-neutral-900">{priceLabel}</p>
              <p className="mt-2 text-xs text-neutral-500">{t.shopRetailAvailability}</p>

              {detail.holdLevel != null ? (
                <div className="mt-4 space-y-1">
                  <HoldShineMeter label={t.shopHoldMeter} level={detail.holdLevel} />
                  <HoldShineMeter label={t.shopShineMeter} level={detail.shineLevel ?? 3} />
                </div>
              ) : null}

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-neutral-900">{t.shopWhyWeLoveIt}</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-neutral-700">
                  {detail.benefits.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-neutral-900">{t.shopHowToUse}</h3>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-neutral-700">
                  {detail.howToUse.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>

              <ul className="mt-5 space-y-1 text-xs text-neutral-500">
                <li>{t.shopInSalonPickup}</li>
                <li>{t.shopTrustManualReview}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ShopQuantityStepper
              value={quantity}
              onChange={setQuantity}
              decreaseLabel={t.shopDecreaseQty}
              increaseLabel={t.shopIncreaseQty}
              quantityLabel={t.shopQuantityLabel}
            />
            <button
              type="button"
              onClick={() => onAddToCart(quantity)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] sm:w-auto"
            >
              {t.shopAddToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
