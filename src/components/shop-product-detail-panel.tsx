"use client";

import { useEffect, useState } from "react";
import { getProductDetailContent } from "@/lib/shop-product-detail";
import type { ShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { ShopImageSwipe } from "@/components/shop-image-swipe";
import { ShopQuantityStepper } from "@/components/shop-quantity-stepper";

type Product = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
};

type CategoryKey = "shampoo" | "conditioner" | "treatment" | "styling" | "apparel" | "uncategorized";

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
  onAddToCart: (quantity: number, size?: string) => void;
  priceLabel: string;
  categoryLabel: string;
}) {
  const title = locale === "zh-HK" ? product.nameZh : product.nameEn;
  const detail = getProductDetailContent(product.id, category, locale, {
    nameZh: product.nameZh,
    nameEn: product.nameEn,
  });
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const sizes = detail.sizes ?? [];
  const gallery =
    detail.gallery?.length
      ? detail.gallery
      : product.imageUrl
        ? [{ src: product.imageUrl, label: title }]
        : [];

  useEffect(() => {
    setQuantity(1);
    setSize(null);
    setSizeError(false);
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
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-6">
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="sm:grid sm:grid-cols-2 sm:gap-6 sm:p-6">
            <div className="bg-neutral-50 sm:rounded-xl">
              {gallery.length ? (
                <ShopImageSwipe
                  slides={gallery}
                  title={title}
                  sizes="(max-width: 640px) 100vw, 360px"
                  frameClassName="relative h-[34vh] min-h-[200px] w-full sm:aspect-square sm:h-auto"
                  imageClassName="h-full w-full object-contain p-3"
                  showCaption
                  priority
                />
              ) : null}
            </div>

            <div className="flex flex-col px-4 py-3 sm:px-0 sm:py-0">
              {detail.salonPick ? (
                <span className="mb-2 w-fit rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {t.shopSalonPick}
                </span>
              ) : null}
              <h2 id="shop-pdp-title" className="text-xl font-semibold text-neutral-900 sm:text-2xl">
                {title}
              </h2>
              <p className="mt-2 text-lg font-medium text-neutral-900">{priceLabel}</p>
              <p className="mt-1 text-xs text-neutral-500">{t.shopRetailAvailability}</p>

              {detail.story?.length ? (
                <div className="mt-4 space-y-3 text-sm leading-cjk text-neutral-700">
                  {detail.story.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

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

        <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          {sizes.length ? (
            <div className="mb-3">
              <p id="shop-pdp-size-label" className="text-sm font-semibold text-neutral-900">
                {t.shopSizeLabel}
              </p>
              <div
                className="mt-2 flex flex-wrap gap-2"
                role="radiogroup"
                aria-labelledby="shop-pdp-size-label"
              >
                {sizes.map((option) => {
                  const selected = size === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setSize(option);
                        setSizeError(false);
                      }}
                      className={`min-h-10 min-w-12 rounded-full border px-3 text-sm font-medium transition ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-neutral-300 bg-white text-neutral-800 hover:border-zinc-900"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {sizeError ? (
                <p className="mt-2 text-xs text-red-700" role="alert">
                  {t.shopSizeRequired}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            <ShopQuantityStepper
              value={quantity}
              onChange={setQuantity}
              decreaseLabel={t.shopDecreaseQty}
              increaseLabel={t.shopIncreaseQty}
              quantityLabel={t.shopQuantityLabel}
            />
            <button
              type="button"
              onClick={() => {
                if (sizes.length && !size) {
                  setSizeError(true);
                  return;
                }
                onAddToCart(quantity, size ?? undefined);
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
            >
              {t.shopAddToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
