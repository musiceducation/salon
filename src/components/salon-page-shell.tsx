import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Locale, Messages } from "@/lib/i18n";
import { localeHref } from "@/lib/locale-path";
import { salonFloatPaddingClass } from "@/lib/salon-site";
import { SalonHeader } from "@/components/salon-header";
import { SalonTopBar } from "@/components/salon-top-bar";
import { SiteFooter } from "@/components/site-footer";

/** Fixed overlay — keep off the initial JS path; markup still SSR'd. */
const WeChatFloat = dynamic(() =>
  import("@/components/wechat-float").then((m) => m.WeChatFloat),
);

type Props = {
  locale: Locale;
  t: Messages;
  displayEmail: string;
  wechatId: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  jsonLd: unknown;
  children: ReactNode;
};

export function SalonPageShell({
  locale,
  t,
  displayEmail,
  wechatId,
  facebookUrl,
  instagramUrl,
  jsonLd,
  children,
}: Props) {
  const productsPath = localeHref(locale, "products");

  return (
    <div
      id="main-content"
      lang={locale}
      tabIndex={-1}
      className={`min-h-screen bg-zinc-50 text-zinc-900 ${salonFloatPaddingClass}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SalonTopBar
        address={t.address}
        email={displayEmail}
        phone={t.phone}
        hoursLine={t.topBarHoursLine}
      />
      <SalonHeader
        brandName={t.brandName}
        home={t.navHome}
        priceList={t.navPriceList}
        contact={t.navContact}
        shop={t.navShop}
        searchLabel={t.navSearchLabel}
        searchAria={t.searchAria}
        cartAria={t.cartAria}
        cartEmpty={t.cartEmpty}
        locale={locale}
        productsPath={productsPath}
      />
      {children}
      <WeChatFloat
        wechatId={wechatId}
        title={t.wechatBubbleTitle}
        body={t.wechatBubbleBody.replace("{wechat}", wechatId)}
        copiedLabel={t.wechatIdCopied}
      />
      <SiteFooter
        tagline={t.footerTagline}
        logoPrimary={t.footerLogoPrimary}
        logoSub={t.footerLogoSub}
        contactHeading={t.footerContactHeading}
        emailLinePrefix={t.emailLinePrefix}
        telLinePrefix={t.telLinePrefix}
        wechatLabel={t.contactWechatLabel}
        address={t.address}
        phone={t.phone}
        email={displayEmail}
        hoursTitle={t.hoursFooterTitle}
        hoursDetail={t.hoursDetail}
        wechatId={wechatId}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        copyright={t.footerCopyright.replace("{year}", String(new Date().getFullYear()))}
      />
    </div>
  );
}
