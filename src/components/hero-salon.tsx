import Link from "next/link";
import { ArtDirectedPhoto } from "@/components/art-directed-photo";

type Props = {
  brandTitle: string;
  brandSubtitle: string;
  kw1: string;
  kw2: string;
  kw3: string;
  contactCta: string;
  shopNow: string;
  shopHref: string;
};

const HERO_DESKTOP = "/ad-stock/03-salon-interior-wide.webp";
const HERO_MOBILE = "/ad-stock/03-salon-interior-640.webp";

export function HeroSalon(p: Props) {
  return (
    <section className="relative isolate min-h-[min(72vh,720px)] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ArtDirectedPhoto
          priority
          mobile={{ src: HERO_MOBILE, width: 640, height: 360, media: "(max-width: 767px)" }}
          desktop={{ src: HERO_DESKTOP, width: 1024, height: 576, media: "(min-width: 768px)" }}
          className="hero-photo absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(24, 24, 27, 0.88) 0%, rgba(24, 24, 27, 0.5) 45%, rgba(24, 24, 27, 0.78) 100%)",
          }}
          aria-hidden
        />
      </div>
      <div className="hero-depth" aria-hidden>
        <div className="hero-depth-stage">
          <div className="hero-depth-disc" />
          <div className="hero-depth-ring" />
          <div className="hero-depth-ring-inner" />
        </div>
      </div>
      <div className="relative z-10 mx-auto flex min-h-[min(72vh,720px)] max-w-6xl flex-col justify-center gap-6 px-4 py-20 sm:px-6 sm:py-24">
        <h1 className="heading-hero max-w-3xl text-white">{p.brandTitle}</h1>
        <p className="max-w-measure text-base leading-cjk text-zinc-200 sm:text-lg">
          {p.brandSubtitle}
        </p>
        <div className="flex max-w-3xl flex-wrap gap-2.5 sm:gap-3">
          {[p.kw1, p.kw2, p.kw3].map((k, i) => (
            <span
              key={`${k}-${i}`}
              className={`rounded-full border border-white/30 bg-gradient-to-r from-black/50 via-black/40 to-black/50 px-3.5 py-1.5 text-[0.8125rem] font-medium text-white shadow-sm backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm ${
                i === 2 ? "border-white/40 bg-gradient-to-r from-white/5 via-white/10 to-white/5" : ""
              }`}
            >
              {k}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            {p.contactCta}
          </a>
          <Link
            href={p.shopHref}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10"
          >
            {p.shopNow}
          </Link>
        </div>
      </div>
    </section>
  );
}
