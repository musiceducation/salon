"use client";

type ShopQuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  quantityLabel: string;
  /** `stage` sits on the dark product hero. */
  tone?: "light" | "stage";
};

export function ShopQuantityStepper({
  value,
  min = 1,
  max = 10,
  onChange,
  decreaseLabel,
  increaseLabel,
  quantityLabel,
  tone = "light",
}: ShopQuantityStepperProps) {
  const stage = tone === "stage";
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <div
      className={
        stage
          ? "inline-flex items-center border border-white/25 bg-transparent"
          : "inline-flex items-center rounded-lg border border-neutral-300 bg-white"
      }
    >
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={
          stage
            ? "flex h-11 w-11 shrink-0 items-center justify-center text-lg text-stone-100 transition hover:bg-white/10 disabled:opacity-40"
            : "flex h-11 w-11 shrink-0 items-center justify-center text-lg text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40"
        }
      >
        −
      </button>
      <span
        className={
          stage
            ? "min-w-[2.5rem] border-x border-white/20 px-2 text-center text-sm tabular-nums text-stone-100"
            : "min-w-[2.5rem] border-x border-neutral-300 px-2 text-center text-sm font-medium tabular-nums text-neutral-900"
        }
        aria-live="polite"
        aria-label={`${quantityLabel}: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={
          stage
            ? "flex h-11 w-11 shrink-0 items-center justify-center text-lg text-stone-100 transition hover:bg-white/10 disabled:opacity-40"
            : "flex h-11 w-11 shrink-0 items-center justify-center text-lg text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40"
        }
      >
        +
      </button>
    </div>
  );
}
