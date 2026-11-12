import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { getMessages, type Locale } from "@/lib/i18n";
import { localeHref } from "@/lib/locale-path";
import { publicAssetPath } from "@/lib/public-asset-path";
import {
  TONSO_TEE_CANONICAL_URL,
  TONSO_TEE_MEMBER_PRICE_CENTS,
  TONSO_TEE_PHOTOS,
  TONSO_TEE_QR_PATH,
  TONSO_TEE_SIZE_CHART,
  TONSO_TEE_SIZE_HEADERS,
  TONSO_TEE_SIZE_NOTE,
  TONSO_TEE_SIZES,
  TONSO_TEE_SLUG,
} from "@/lib/tonso-tee";

type Props = {
  locale: Locale;
  title: string;
  priceCents: number;
  story: string[];
  care: string[];
};

export function TonsoTeeFlyer({ locale, title, priceCents, story, care }: Props) {
  const t = getMessages(locale);
  const zh = locale === "zh-HK";
  const priceLabel = formatMoney(priceCents, "mop");
  const memberLabel = formatMoney(TONSO_TEE_MEMBER_PRICE_CENTS, "mop");
  const checkoutAction = `${localeHref(locale, "products")}#shop-checkout`;
  const shopHref = localeHref(locale, "products");
  const homeHref = localeHref(locale);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="text-sm text-zinc-600" aria-label="Breadcrumb">
        <Link href={homeHref} className="underline-offset-4 hover:text-zinc-900 hover:underline">
          {t.navHome}
        </Link>
        <span className="text-zinc-400" aria-hidden>
          {" "}
          /{" "}
        </span>
        <Link href={shopHref} className="underline-offset-4 hover:text-zinc-900 hover:underline">
          {t.shopSectionTitle}
        </Link>
        <span className="text-zinc-400" aria-hidden>
          {" "}
          /{" "}
        </span>
        <span className="text-zinc-900">tonso · lamp</span>
      </nav>

      <div className="mt-6 overflow-hidden border border-zinc-200 bg-white shadow-sm">
        <header className="bg-zinc-950 px-5 py-8 text-stone-100 sm:px-10 sm:py-12">
          <p className="text-[11px] tracking-[0.32em] text-stone-400">n_nsalon · tonso · lamp</p>
          <h1 className="heading-section mt-3 max-w-3xl text-stone-50">{title}</h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-stone-300">
            <span className="inline-block h-3.5 w-3.5 border border-stone-500 bg-black" aria-hidden />
            {zh ? "顏色：啞黑（只此一色）" : "Colour: matte black only"}
          </p>
          <p className="mt-6 text-4xl font-medium tracking-tight text-white">{priceLabel}</p>
          <p className="mt-2 max-w-md text-sm leading-cjk text-zinc-400">
            {zh
              ? `門市會員專享 ${memberLabel}。此為到店備註，並非第二個網上售價。`
              : `In-store members ${memberLabel}. A note for the salon, not a second online price.`}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-px bg-zinc-800 lg:grid-cols-4">
          {TONSO_TEE_PHOTOS.map((photo, index) => {
            const label = zh ? photo.labelZh : photo.labelEn;
            return (
              <figure key={photo.src} className="bg-zinc-950">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={publicAssetPath(photo.src)}
                    alt={`${title} — ${label}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 280px"
                    className="object-contain object-center"
                    priority={index === 0}
                  />
                </div>
                <figcaption className="px-2 py-2 text-center text-[11px] tracking-wide text-stone-400">
                  {label}
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div
          id="order"
          className="scroll-mt-24 grid gap-8 border-b border-zinc-200 px-5 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_220px]"
        >
          <form action={checkoutAction} method="get" className="flex flex-col">
            <input type="hidden" name="cart" value="1" />
            <input type="hidden" name="sku" value={TONSO_TEE_SLUG} />
            <fieldset aria-describedby="tee-size-hint">
              <legend id="tee-size-label" className="text-sm font-semibold text-zinc-900">
                {t.shopSizeLabel}
              </legend>
              <p id="tee-size-hint" className="mt-1 text-xs leading-cjk text-zinc-500">
                {zh ? "寬鬆版，請選一個尺碼（S–2XL）。" : "Oversized fit. Choose one size (S–2XL)."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TONSO_TEE_SIZES.map((size) => (
                  <label key={size} className="cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      required
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-11 min-w-12 items-center justify-center rounded-full border border-zinc-300 px-3 text-sm font-medium text-zinc-800 peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900 peer-focus-visible:ring-offset-2">
                      {size}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-5 flex items-center gap-3 text-sm text-zinc-700">
              <span>{t.shopQuantityLabel}</span>
              <select
                name="qty"
                defaultValue="1"
                className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900"
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-fit"
            >
              {zh ? "加入購物車，前往結帳" : "Add to cart and check out"}
            </button>
            <p className="mt-3 max-w-md text-xs leading-cjk text-zinc-500">
              {zh
                ? "下一頁沿用現有購物車，以 MPay 或中銀轉帳付款。不會跳到外部表格。"
                : "The next page uses the existing cart, then MPay or BOC transfer. No external form."}
            </p>
          </form>

          <figure className="flex flex-col items-center border border-zinc-200 bg-zinc-50 px-4 py-4">
            <img
              src={publicAssetPath(TONSO_TEE_QR_PATH)}
              width={168}
              height={168}
              alt={zh ? "開啟此商品頁的二維碼" : "QR code for this product page"}
              className="h-auto w-[168px] bg-white"
            />
            <figcaption className="mt-3 text-center text-xs leading-relaxed text-zinc-600">
              {zh
                ? "掃碼開啟此頁。印刷與轉發都用這個碼，網址固定在正式站。"
                : "Scan to open this page. Printed and shared codes stay on the live site."}
              <span className="mt-2 block break-all font-mono text-[10px] text-zinc-500">
                {TONSO_TEE_CANONICAL_URL}
              </span>
            </figcaption>
          </figure>
        </div>

        <section className="px-5 py-8 sm:px-10" aria-labelledby="tee-size-chart-title">
          <h2 id="tee-size-chart-title" className="text-sm font-semibold text-zinc-900">
            {zh ? "尺碼表" : "Size chart"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 sm:hidden">
            {zh ? "表格可左右滑動。" : "Swipe the chart sideways."}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                {zh ? "tonso · lamp 寬鬆短袖尺碼表，體重單位為斤" : "tonso · lamp oversized tee size chart"}
              </caption>
              <thead className="bg-zinc-950 text-stone-100">
                <tr>
                  {TONSO_TEE_SIZE_HEADERS.map((header) => (
                    <th key={header} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TONSO_TEE_SIZE_CHART.map((row) => (
                  <tr key={row.size} className="border-b border-zinc-200 odd:bg-zinc-50">
                    <th scope="row" className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-900">
                      {row.size}
                    </th>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-800">{row.height}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-800">{row.weight}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-800">{row.chest}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-800">{row.shoulder}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-800">{row.sleeve}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-zinc-800">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-cjk text-zinc-500">{TONSO_TEE_SIZE_NOTE}</p>
          {zh ? null : (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Handmade measurements can vary by about 1–3 cm. That is normal. Weight stays in 斤.
            </p>
          )}
        </section>

        <section className="border-t border-zinc-200 px-5 py-8 sm:px-10" aria-labelledby="tee-story-title">
          <h2 id="tee-story-title" className="text-sm font-semibold text-zinc-900">
            {zh ? "關於這件" : "About this tee"}
          </h2>
          <div className="mt-4 max-w-measure space-y-3 text-sm leading-cjk text-zinc-700">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {care.length ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-900">{t.shopHowToUse}</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-cjk text-zinc-700">
                {care.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      </div>
    </article>
  );
}
