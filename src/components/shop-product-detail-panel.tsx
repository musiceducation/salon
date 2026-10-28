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
    <p className="text-xs text-stone-400">
      {label}{" "}
      <span className="font-medium tracking-wider text-stone-200" aria-hidden>
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
  memberNote,
}: {
  product: Product;
  locale: string;
  category: CategoryKey;
  t: ShopCheckoutCopy;
  onClose: () => void;
  onAddToCart: (quantity: number, size?: string) => void;
  priceLabel: string;
  categoryLabel: string;
  memberNote?: string | null;
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
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-3 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label={t.shopClose}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-pdp-title"
        className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-[#0c0c0e] text-stone-100 shadow-2xl sm:h-[min(92vh,900px)] sm:border sm:border-white/10"
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
          <p className="text-[10px] tracking-[0.28em] text-stone-500">{categoryLabel}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-stone-400 transition hover:text-white"
            aria-label={t.shopClose}
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:overflow-hidden">
          <div className="showroom-bay relative min-h-[42vh] lg:h-full lg:min-h-0">
            {gallery.length ? (
              <ShopImageSwipe
                slides={gallery}
                title={title}
                sizes="(max-width: 1024px) 100vw, 640px"
                frameClassName="relative h-[42vh] min-h-[240px] w-full lg:absolute lg:inset-0 lg:h-full"
                imageClassName="showroom-arrive h-full w-full object-contain p-6 sm:p-10"
                priority
              />
            ) : null}
            <div className="showroom-vignette pointer-events-none absolute inset-0" />
            <div className="showroom-hero-plinth pointer-events-none absolute inset-x-0 bottom-0" />
            <div className="showroom-led pointer-events-none absolute inset-x-8 bottom-0" />
          </div>

          <div className="flex flex-col px-5 py-6 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-8">
            {detail.salonPick ? (
              <p className="text-[10px] tracking-[0.28em] text-[#9eb6ff]">{t.shopSalonPick}</p>
            ) : null}
            <h2
              id="shop-pdp-title"
              className="mt-3 max-w-md text-base font-normal leading-snug tracking-wide text-stone-300 sm:text-lg"
            >
              {title}
            </h2>
            <p className="showroom-arrive mt-12 font-light leading-none tracking-tight text-stone-50 text-[clamp(3.25rem,8vw,5.75rem)] sm:mt-16">
              {priceLabel}
            </p>
            {memberNote ? <p className="mt-3 text-xs tracking-wide text-stone-500">{memberNote}</p> : null}
            <p className="mt-4 text-[11px] tracking-wide text-stone-500">{t.shopRetailAvailability}</p>

            {detail.story?.length ? (
              <div className="mt-10 space-y-3 text-sm leading-cjk text-stone-400">
                {detail.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {detail.holdLevel != null ? (
              <div className="mt-6 space-y-1">
                <HoldShineMeter label={t.shopHoldMeter} level={detail.holdLevel} />
                <HoldShineMeter label={t.shopShineMeter} level={detail.shineLevel ?? 3} />
              </div>
            ) : null}

            <div className="mt-8">
              <h3 className="text-[11px] tracking-[0.22em] text-stone-500">{t.shopWhyWeLoveIt}</h3>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-cjk text-stone-300">
                {detail.benefits.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-[11px] tracking-[0.22em] text-stone-500">{t.shopHowToUse}</h3>
              <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm leading-cjk text-stone-300">
                {detail.howToUse.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>

            <ul className="mt-6 space-y-1 pb-4 text-[11px] leading-relaxed text-stone-500">
              <li>{t.shopInSalonPickup}</li>
              <li>{t.shopTrustManualReview}</li>
            </ul>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#0c0c0e] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          {sizes.length ? (
            <div className="mb-3">
              <p id="shop-pdp-size-label" className="text-[11px] tracking-[0.18em] text-stone-400">
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
                      className={`min-h-11 min-w-12 border px-3 text-sm transition ${
                        selected
                          ? "border-stone-100 bg-stone-100 text-zinc-950"
                          : "border-white/25 bg-transparent text-stone-200 hover:border-white/60"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {sizeError ? (
                <p className="mt-2 text-xs text-red-300" role="alert">
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
              tone="stage"
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
              className="inline-flex min-h-12 flex-1 items-center justify-center border border-stone-200/80 px-6 text-sm tracking-wide text-stone-100 transition hover:bg-white hover:text-zinc-950"
            >
              {t.shopAddToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
