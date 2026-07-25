import { Fragment, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getPriceListData } from "@/data/price-list";
import type {
  PriceCompareSection,
  PriceDyeCutSection,
  PriceEventsSection,
  PriceListSection,
  PriceMembershipSection,
  PriceNanoSection,
} from "@/data/price-list";

type Props = {
  locale: Locale;
  priceListTitle: string;
  intro: string;
  disclaimer: string;
};

/** Light cards aligned with homepage story/services sections; tight padding to limit 留白 */
const panel =
  "scroll-mt-20 rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:scroll-mt-24 sm:p-5";

/** Shared table shell: dense rows still need CJK-safe leading, and numerals stay aligned. */
const table = "w-full border-collapse text-left text-sm leading-cjk-tight text-zinc-900";

/** Small tracked-out label used for the groupings inside a panel. */
const microLabel = "text-xs font-semibold uppercase tracking-wider";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="label-eyebrow border-l-[3px] border-amber-500 pl-2.5 text-zinc-900 sm:pl-3">
      {children}
    </h3>
  );
}

function CompareTableBlock({ s }: { s: PriceCompareSection }) {
  return (
    <div id={s.id} className={panel}>
      <SectionTitle>{s.title}</SectionTitle>
      {s.note ? <p className="mt-2 text-sm leading-cjk text-zinc-600">{s.note}</p> : null}
      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200/90">
        <table className={`${table} min-w-[480px]`}>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-2.5 py-2 font-semibold text-zinc-700 sm:px-3 sm:py-2.5">{""}</th>
              <th className="px-2.5 py-2 text-right font-semibold text-amber-900 sm:px-3 sm:py-2.5">
                {s.colMember}
              </th>
              <th className="px-2.5 py-2 text-right font-semibold text-zinc-700 sm:px-3 sm:py-2.5">
                {s.colGuest}
              </th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map((row) => (
              <tr key={row.service} className="border-b border-zinc-100 last:border-0">
                <td className="px-2.5 py-2 align-top text-zinc-800 sm:px-3 sm:py-2.5">{row.service}</td>
                <td className="px-2.5 py-2 align-top text-right tabular-nums font-medium text-amber-900 sm:px-3 sm:py-2.5">
                  {row.member}
                </td>
                <td className="px-2.5 py-2 align-top text-right tabular-nums text-zinc-700 sm:px-3 sm:py-2.5">
                  {row.guest}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MembershipBlock({ s }: { s: PriceMembershipSection }) {
  return (
    <div id={s.id} className={panel}>
      <SectionTitle>{s.title}</SectionTitle>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
        {s.groups.map((g) => (
          <div key={g.heading} className="rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-3 py-3">
            <p className={`${microLabel} text-amber-900/90`}>{g.heading}</p>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-800">
              {g.lines.map((line) => (
                <li key={line} className="tabular-nums leading-cjk-tight">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {s.footnotes.length > 0 ? (
        <ul className="mt-4 space-y-1.5 border-t border-zinc-200/90 pt-3 text-[0.8125rem] leading-cjk text-zinc-500">
          {s.footnotes.map((f) => (
            <li key={f}>· {f}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function NanoBlock({ s }: { s: PriceNanoSection }) {
  return (
    <div id={s.id} className={`${panel} border-amber-200/70 bg-amber-50/20`}>
      <SectionTitle>{s.title}</SectionTitle>
      <p className="mt-2 max-w-measure text-sm leading-cjk text-zinc-700">{s.lead}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {s.bullets.map((b, i) => (
          <li
            key={i}
            className={`rounded-lg px-3 py-2 text-sm leading-cjk-tight ${
              i % 2 === 0 ? "bg-rose-50 text-rose-950/90" : "bg-sky-50 text-sky-950/90"
            }`}
          >
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {s.priceBlocks.map((block) => (
          <div key={block.subtitle} className="rounded-lg border border-zinc-200/90 bg-white p-3">
            <p className={`${microLabel} text-zinc-600`}>{block.subtitle}</p>
            <ul className="mt-2 space-y-1 text-sm leading-cjk-tight">
              {block.rows.map((r) => (
                <li
                  key={r.label}
                  className="flex justify-between gap-2 border-b border-zinc-100 py-1.5 last:border-0"
                >
                  <span className="text-zinc-800">{r.label}</span>
                  <span className="shrink-0 tabular-nums font-medium text-amber-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {s.courseCards.map((c) => (
          <div
            key={c.label}
            className="min-w-[9rem] flex-1 rounded-lg border border-amber-200/90 bg-amber-50/80 px-3 py-2"
          >
            <p className="text-xs leading-cjk-tight text-amber-950/80">{c.label}</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-zinc-900">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium leading-cjk text-emerald-800">{s.promoLine}</p>
      <p className="mt-1 text-sm leading-cjk text-zinc-600">{s.contactLine}</p>
    </div>
  );
}

function DyeCutBlock({ s }: { s: PriceDyeCutSection }) {
  const colMember = s.blocks[0]?.colMember ?? "";
  const colGuest = s.blocks[0]?.colGuest ?? "";
  return (
    <div id={s.id} className={panel}>
      <SectionTitle>{s.title}</SectionTitle>
      {s.note ? (
        <p className="mt-2 text-sm font-medium leading-cjk text-amber-900/90">{s.note}</p>
      ) : null}
      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200/90">
        <table className={`${table} min-w-[480px]`}>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-2.5 py-2 sm:px-3 sm:py-2.5">{""}</th>
              <th className="px-2.5 py-2 text-right font-semibold text-amber-900 sm:px-3 sm:py-2.5">
                {colMember}
              </th>
              <th className="px-2.5 py-2 text-right font-semibold text-zinc-700 sm:px-3 sm:py-2.5">
                {colGuest}
              </th>
            </tr>
          </thead>
          <tbody>
            {s.blocks.map((block) => (
              <Fragment key={block.subtitle ?? "block"}>
                <tr className="border-b border-zinc-200 bg-zinc-100/90">
                  <td colSpan={3} className={`${microLabel} px-2.5 py-2 text-zinc-700 sm:px-3`}>
                    {block.subtitle ?? ""}
                  </td>
                </tr>
                {block.rows.map((row) => (
                  <tr
                    key={`${block.subtitle ?? ""}-${row.label}`}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-2.5 py-2 align-top text-zinc-800 sm:px-3 sm:py-2">{row.label}</td>
                    <td className="px-2.5 py-2 align-top text-right tabular-nums font-medium text-amber-900 sm:px-3 sm:py-2">
                      {row.member}
                    </td>
                    <td className="px-2.5 py-2 align-top text-right tabular-nums text-zinc-700 sm:px-3 sm:py-2">
                      {row.guest}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventsBlock({ s }: { s: PriceEventsSection }) {
  return (
    <div id={s.id} className={panel}>
      <SectionTitle>{s.title}</SectionTitle>
      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200/90">
        <table className={`${table} min-w-[320px]`}>
          <tbody>
            {s.rows.map((row) => (
              <tr key={row.name} className="border-b border-zinc-100 last:border-0">
                <td className="max-w-[70%] py-2 pr-4 align-top text-zinc-900 sm:px-3 sm:py-2.5">{row.name}</td>
                <td className="whitespace-nowrap py-2 align-top text-right tabular-nums font-medium text-amber-900 sm:px-3 sm:py-2.5">
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {s.addon ? (
        <p className="mt-3 border-t border-zinc-200/90 pt-3 text-sm leading-cjk text-zinc-600">
          {s.addon}
        </p>
      ) : null}
    </div>
  );
}

function renderSection(s: PriceListSection): ReactNode {
  switch (s.kind) {
    case "compare-table":
      return <CompareTableBlock key={s.id} s={s} />;
    case "membership":
      return <MembershipBlock key={s.id} s={s} />;
    case "nano":
      return <NanoBlock key={s.id} s={s} />;
    case "dye-cut":
      return <DyeCutBlock key={s.id} s={s} />;
    case "events":
      return <EventsBlock key={s.id} s={s} />;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

export function PriceListSection(p: Props) {
  const data = getPriceListData(p.locale);
  return (
    <section id="price-list" className="border-b border-zinc-200/80 bg-white text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="heading-section text-zinc-900">{p.priceListTitle}</h2>
        <p className="mt-4 max-w-measure text-base leading-cjk text-zinc-600">{p.intro}</p>
        <p className="mt-2 max-w-measure text-[0.8125rem] leading-cjk text-zinc-500">{p.disclaimer}</p>
        <div className="mt-6 flex flex-col gap-5 sm:mt-8 sm:gap-6">
          {data.sections.map((s) => renderSection(s))}
        </div>
      </div>
    </section>
  );
}
