"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { publicAssetPath } from "@/lib/public-asset-path";

export type ShopImageSlide = { src: string; label: string };

type Props = {
  slides: ShopImageSlide[];
  title: string;
  /** Tap (not a swipe) opens the product. Omitted in the detail dialog. */
  onActivate?: () => void;
  sizes: string;
  frameClassName: string;
  imageClassName?: string;
  priority?: boolean;
  /** Active slide name, under the frame. */
  showCaption?: boolean;
};

export function ShopImageSwipe({
  slides,
  title,
  onActivate,
  sizes,
  frameClassName,
  imageClassName = "h-full w-full object-contain",
  priority = false,
  showCaption = false,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, scroll: 0, pointerId: -1, tracking: false, mouse: false });
  const movedRef = useRef(false);
  const [index, setIndex] = useState(0);

  if (slides.length === 0) {
    return null;
  }

  if (slides.length === 1) {
    const slide = slides[0];
    const image = (
      <Image
        src={publicAssetPath(slide.src)}
        alt={slide.label ? `${title} — ${slide.label}` : title}
        width={480}
        height={640}
        sizes={sizes}
        className={imageClassName}
        priority={priority}
      />
    );
    const frame = onActivate ? (
      <button type="button" onClick={onActivate} className={`block ${frameClassName}`} aria-label={title}>
        {image}
      </button>
    ) : (
      <div className={frameClassName}>{image}</div>
    );
    if (!showCaption || !slide.label) {
      return frame;
    }
    return (
      <div>
        {frame}
        <p className="px-3 py-1.5 text-center text-[11px] text-neutral-500">{slide.label}</p>
      </div>
    );
  }

  function syncIndex() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth <= 0) {
      return;
    }
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.min(slides.length - 1, Math.max(0, next)));
  }

  function go(next: number) {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
    setIndex(next);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    const el = scrollerRef.current;
    pointerRef.current = {
      x: event.clientX,
      scroll: el?.scrollLeft ?? 0,
      pointerId: event.pointerId,
      tracking: true,
      mouse: event.pointerType === "mouse",
    };
    movedRef.current = false;
    if (event.pointerType === "mouse") {
      el?.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;
    if (!pointer.tracking || event.pointerId !== pointer.pointerId) {
      return;
    }
    const dx = event.clientX - pointer.x;
    if (Math.abs(dx) > 8) {
      movedRef.current = true;
    }
    if (pointer.mouse && scrollerRef.current) {
      scrollerRef.current.scrollLeft = pointer.scroll - dx;
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;
    if (event.pointerId !== pointer.pointerId) {
      return;
    }
    pointer.tracking = false;
    if (pointer.mouse && scrollerRef.current?.hasPointerCapture(event.pointerId)) {
      scrollerRef.current.releasePointerCapture(event.pointerId);
    }
  }

  const frame = (
    <div className={`relative ${frameClassName}`} data-slide-index={index} data-slide-count={slides.length}>
      <div
        ref={scrollerRef}
        onScroll={syncIndex}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          const movedScroll = Math.abs((scrollerRef.current?.scrollLeft ?? 0) - pointerRef.current.scroll);
          if (movedRef.current || movedScroll > 8) {
            return;
          }
          onActivate?.();
        }}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={title}
      >
        {slides.map((slide, slideIndex) => (
          <div key={slide.src} className="h-full min-w-full shrink-0 snap-center">
            <Image
              src={publicAssetPath(slide.src)}
              alt={`${title} — ${slide.label}`}
              width={480}
              height={640}
              sizes={sizes}
              className={imageClassName}
              priority={priority && slideIndex === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
        <div
          className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-0.5"
          role="tablist"
          aria-label={title}
        >
          {slides.map((slide, slideIndex) => {
            const selected = slideIndex === index;
            return (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={slide.label}
                onClick={(event) => {
                  event.stopPropagation();
                  go(slideIndex);
                }}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`h-1.5 rounded-full transition-[width,background-color] ${
                    selected ? "w-3.5 bg-white" : "w-1.5 bg-white/55"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!showCaption) {
    return frame;
  }

  return (
    <div>
      {frame}
      <p className="px-3 py-1.5 text-center text-[11px] tracking-wide text-neutral-500">
        {slides[index]?.label}
      </p>
    </div>
  );
}
