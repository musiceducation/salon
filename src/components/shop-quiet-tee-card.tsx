import Image from "next/image";
import { publicAssetPath } from "@/lib/public-asset-path";

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  price: string;
  member: string;
  cta: string;
  ctaHref: string;
  imageAlt: string;
};

const TEE_IMAGE = "/shop/tonso-memorial-tee.png";

/** Quiet home note for the memorial tee. Sits beside the hair-care shop banner. */
export function ShopQuietTeeCard(p: Props) {
  return (
    <section className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 sm:flex-row sm:px-6 sm:py-14">
        <div className="relative aspect-[4/5] w-44 shrink-0 overflow-hidden bg-black sm:w-52">
          <Image
            src={publicAssetPath(TEE_IMAGE)}
            alt={p.imageAlt}
            fill
            sizes="208px"
            className="object-contain object-center"
          />
        </div>
        <div className="max-w-xl text-center sm:text-left">
          <p className="text-[11px] tracking-[0.32em] text-stone-400">{p.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-stone-100">{p.title}</h2>
          <p className="mt-4 text-sm leading-cjk text-zinc-400">{p.body}</p>
          <p className="mt-5 text-sm text-stone-200">{p.price}</p>
          <p className="mt-1 text-xs text-zinc-500">{p.member}</p>
          <a
            href={p.ctaHref}
            className="mt-6 inline-flex items-center justify-center border border-stone-500/80 px-5 py-2.5 text-sm text-stone-100 transition hover:border-stone-300 hover:bg-zinc-900"
          >
            {p.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
