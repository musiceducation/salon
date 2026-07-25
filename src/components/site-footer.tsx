import { buildTelHref } from "@/lib/tel-href";

const iconFacebook = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9.101 23.127V12.896H5.637v-4.09H9.1V6.149c0-3.476 1.897-5.406 5.476-5.406 1.477 0 2.724.101 3.091.148v3.587h-2.122c-1.662 0-1.983.79-1.983 1.951v2.467h4.148l-.556 4.09h-3.592v10.231H9.101z" />
  </svg>
);

const iconInstagram = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 1.5A4 4 0 0 0 3.5 7.5v9a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4h-9zm4.5 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-2.25a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z" />
  </svg>
);

type FooterProps = {
  tagline: string;
  logoPrimary: string;
  logoSub: string;
  contactHeading: string;
  emailLinePrefix: string;
  telLinePrefix: string;
  whatsappLabel: string;
  address: string;
  phone: string;
  email: string;
  hoursTitle: string;
  hoursDetail: string;
  whatsappUrl: string | null;
  waDisplay: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
};

export function SiteFooter(p: FooterProps) {
  const telHref = buildTelHref(p.phone);
  const hasWhatsapp = Boolean(p.whatsappUrl);
  const phoneDisplay = `+853 ${p.phone}`;

  return (
    <footer
      id="contact"
      className="border-t border-white/10 bg-black text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-12 sm:gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {p.logoPrimary}
            </p>
            <p className="mt-1.5 text-[0.8125rem] font-medium tracking-logo text-zinc-400">
              {p.logoSub}
            </p>
            {/* Prose, not a label: the tagline is a full sentence, so it keeps sentence case
                and normal tracking instead of the uppercase treatment used for headings. */}
            <p className="mt-8 max-w-sm text-sm leading-cjk text-zinc-300">{p.tagline}</p>
            {(p.facebookUrl || p.instagramUrl) && (
              <div className="mt-8 flex items-center gap-4 text-white">
                {p.facebookUrl ? (
                  <a
                    href={p.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:opacity-80"
                    aria-label="Facebook"
                  >
                    {iconFacebook}
                  </a>
                ) : null}
                {p.facebookUrl && p.instagramUrl ? (
                  <span className="h-4 w-px bg-white/30" aria-hidden />
                ) : null}
                {p.instagramUrl ? (
                  <a
                    href={p.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:opacity-80"
                    aria-label="Instagram"
                  >
                    {iconInstagram}
                  </a>
                ) : null}
              </div>
            )}
          </div>
          <div>
            <h3 className="label-eyebrow tracking-label-wide text-white">{p.contactHeading}</h3>
            <p className="mt-5 text-sm leading-cjk text-zinc-300">{p.address}</p>
            <p className="mt-4 text-sm leading-cjk text-zinc-300">
              <span className="text-zinc-500">{p.emailLinePrefix}</span>{" "}
              <a
                className="text-white underline decoration-white/30 underline-offset-2 transition hover:decoration-white"
                href={`mailto:${p.email}`}
              >
                {p.email}
              </a>
            </p>
            <p className="mt-2 text-sm leading-cjk text-zinc-300">
              <span className="text-zinc-500">{p.telLinePrefix}</span>{" "}
              <a
                className="text-white underline decoration-white/30 underline-offset-2 transition hover:decoration-white"
                href={telHref}
              >
                {phoneDisplay}
              </a>
            </p>
            {hasWhatsapp && p.whatsappUrl ? (
              <p className="mt-2 text-sm leading-cjk text-zinc-300">
                <span className="text-zinc-500">{p.whatsappLabel}:</span>{" "}
                <a
                  className="text-emerald-400 underline decoration-emerald-400/40 underline-offset-2 transition hover:decoration-emerald-300"
                  href={p.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {p.waDisplay}
                </a>
              </p>
            ) : null}
          </div>
          <div>
            <h3 className="label-eyebrow tracking-label-wide text-white">{p.hoursTitle}</h3>
            <ul className="mt-5 space-y-1.5 text-sm leading-cjk-tight text-zinc-300">
              {p.hoursDetail.split("\n").map((line, i) => (
                <li key={`${i}-${line}`}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
