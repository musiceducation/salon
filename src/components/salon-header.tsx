import Link from "next/link";
import { SalonHeaderMobileNav, SalonHeaderPrimaryNav } from "./salon-header-nav.client";

type Nav = {
  brandName: string;
  home: string;
  priceList: string;
  contact: string;
  shop: string;
  searchAria: string;
  searchLabel: string;
  cartAria: string;
  cartEmpty: string;
  locale: string;
  cartCount: number;
  productsPath: string;
};

const iconSearch = (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const iconCart = (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

const navBase =
  "rounded-md px-2.5 py-1.5 text-zinc-800 transition hover:bg-zinc-100/80";
const navActive = "rounded-md px-2.5 py-1.5 text-zinc-900 underline decoration-zinc-900 underline-offset-4";

const navMobile = "text-zinc-800 transition hover:underline";
const navMobileActive = "text-zinc-900 font-semibold underline decoration-zinc-900 underline-offset-2";

export function SalonHeader(t: Nav) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
        <Link
          href={`/${t.locale}`}
          className="shrink-0 font-display text-lg font-semibold leading-tight tracking-tight text-zinc-900 sm:text-xl"
        >
          {t.brandName}
        </Link>
        <SalonHeaderPrimaryNav
          locale={t.locale}
          home={t.home}
          priceList={t.priceList}
          contact={t.contact}
          shop={t.shop}
          shopPath={t.productsPath}
          baseClass={navBase}
          activeClass={navActive}
        />
        <div className="flex items-center gap-0 sm:gap-0.5">
          <Link
            href={t.productsPath}
            className="group relative inline-flex items-center justify-center rounded-full p-2 text-zinc-800 transition hover:bg-zinc-100 hover:text-zinc-900"
            title={t.cartEmpty}
            aria-label={t.cartAria}
          >
            {iconCart}
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-zinc-900 px-0.5 text-[10px] font-semibold text-white">
              {t.cartCount}
            </span>
            <span className="sr-only">{t.cartEmpty}</span>
          </Link>
          <span className="hidden h-4 w-px self-center bg-zinc-200 sm:block" />
          <Link
            href={t.productsPath}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            title={t.searchAria}
            aria-label={t.searchAria}
          >
            {iconSearch}
            <span className="hidden sm:inline">{t.searchLabel}</span>
          </Link>
          <span className="ml-0.5 hidden h-4 w-px self-center bg-zinc-200 sm:block" />
          <div className="ml-0 flex gap-0.5 pl-0.5 text-xs sm:ml-1 sm:text-sm">
            {t.locale === "en" ? (
              <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-900">EN</span>
            ) : (
              <Link
                className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                href="/en"
              >
                EN
              </Link>
            )}
            {t.locale === "zh-HK" ? (
              <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-900">繁</span>
            ) : (
              <Link
                className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                href="/zh-HK"
              >
                繁
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-100/90 bg-zinc-50/90 px-4 py-1.5 md:hidden">
        <SalonHeaderMobileNav
          locale={t.locale}
          home={t.home}
          priceList={t.priceList}
          contact={t.contact}
          shop={t.shop}
          shopPath={t.productsPath}
          baseClass={navMobile}
          activeClass={navMobileActive}
          rowClassName="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[0.8125rem] font-medium"
        />
      </div>
    </header>
  );
}
