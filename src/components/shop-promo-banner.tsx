import Image from "next/image";
import { publicAssetPath } from "@/lib/public-asset-path";

type Props = {
  title: string;
  body: string;
  cta: string;
  ctaHref: string;
  sansClassName: string;
};

const PROMO_BG = "/ad-stock/04-hair-tools-blowdry.jpg";

export function ShopPromoBanner(p: Props) {
  const bgSrc = publicAssetPath(PROMO_BG);
  return (
    <div className="relative isolate w-full overflow-hidden border-y border-amber-900/30 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={bgSrc}
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          unoptimized
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-amber-950/93 via-zinc-900/90 to-amber-950/93"
          aria-hidden
        />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <h2
            className={`${p.sansClassName} text-sm font-medium uppercase tracking-[0.2em] text-amber-200/90`}
          >
            {p.title}
          </h2>
          <p className={`${p.sansClassName} mt-2 text-base leading-relaxed text-zinc-200 sm:text-lg`}>
            {p.body}
          </p>
        </div>
        <a
          href={p.ctaHref}
          className={`${p.sansClassName} inline-flex w-full shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-50 sm:w-auto sm:py-3.5`}
        >
          {p.cta}
        </a>
      </div>
    </div>
  );
}
