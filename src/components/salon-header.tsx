import Link from "next/link";
import { SalonHeaderMobileNav, SalonHeaderPrimaryNav } from "./salon-header-nav.client";
import { SalonHeaderActions } from "./salon-header-actions.client";
import { SalonLocaleSwitch } from "./salon-locale-switch.client";
import { localeHref } from "@/lib/locale-path";

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
  productsPath: string;
};

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
          href={localeHref(t.locale)}
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
          <SalonHeaderActions
            locale={t.locale}
            searchAria={t.searchAria}
            searchLabel={t.searchLabel}
            cartAria={t.cartAria}
            cartEmpty={t.cartEmpty}
            productsPath={t.productsPath}
          />
          <span className="ml-0.5 hidden h-4 w-px self-center bg-zinc-200 sm:block" />
          <SalonLocaleSwitch locale={t.locale} />
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
