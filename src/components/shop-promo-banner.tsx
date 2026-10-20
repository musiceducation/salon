import Link from "next/link";
import { ArtDirectedPhoto } from "@/components/art-directed-photo";

type Props = {
  title: string;
  body: string;
  cta: string;
  ctaHref: string;
};

const PROMO_DESKTOP = "/ad-stock/04-hair-tools-blowdry.webp";
const PROMO_MOBILE = "/ad-stock/04-hair-tools-blowdry-960.webp";

export function ShopPromoBanner(p: Props) {
  return (
    <div data-reveal className="relative isolate w-full overflow-hidden border-y border-amber-900/30 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ArtDirectedPhoto
          mobile={{ src: PROMO_MOBILE, width: 960, height: 640, media: "(max-width: 767px)" }}
          desktop={{ src: PROMO_DESKTOP, width: 1600, height: 1067, media: "(min-width: 768px)" }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-amber-950/93 via-zinc-900/90 to-amber-950/93"
          aria-hidden
        />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <h2 className="label-eyebrow tracking-label-wide text-amber-200/90">{p.title}</h2>
          <p className="mt-2.5 text-base leading-cjk text-zinc-200 sm:text-lg">{p.body}</p>
        </div>
        <Link
          href={p.ctaHref}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-50 sm:w-auto sm:py-3.5"
        >
          {p.cta}
        </Link>
      </div>
    </div>
  );
}
