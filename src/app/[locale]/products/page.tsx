import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopCheckout } from "@/components/shop-checkout";
import { SalonTopBar } from "@/components/salon-top-bar";
import { SalonHeader } from "@/components/salon-header";
import { SiteFooter } from "@/components/site-footer";
import { WeChatFloat } from "@/components/wechat-float";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getHomeProducts } from "@/lib/home-data";
import { pickShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { getWeChatId } from "@/lib/contact-wechat";
import { localeAbsoluteUrl, localeHref } from "@/lib/locale-path";
import { phoneToE164 } from "@/lib/tel-href";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

const businessSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function ogImageUrl(siteBase: string) {
  return `${siteBase}/ad-stock/03-salon-interior-wide.webp`;
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }
  const t = getMessages(locale);
  const pageUrl = localeAbsoluteUrl(businessSite, locale, "products");
  const shareImage = ogImageUrl(businessSite);
  const title = `${t.shopSectionTitle} · ${t.brandName}`;
  return {
    title,
    description: t.shopSectionNote,
    openGraph: {
      title,
      description: t.shopSectionNote,
      url: pageUrl,
      siteName: "n_nsalon",
      images: [{ url: shareImage, width: 1600, height: 1200, alt: t.brandTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.shopSectionNote,
      images: [shareImage],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        "zh-HK": localeAbsoluteUrl(businessSite, "zh-HK", "products"),
        en: localeAbsoluteUrl(businessSite, "en", "products"),
        "x-default": localeAbsoluteUrl(businessSite, "zh-HK", "products"),
      },
    },
  };
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  if (!isSupportedLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;

  const t = getMessages(locale);
  const initialProducts = await getHomeProducts();

  const sameAs: string[] = [];
  if (process.env.NEXT_PUBLIC_INSTAGRAM_URL) {
    sameAs.push(process.env.NEXT_PUBLIC_INSTAGRAM_URL);
  }
  if (process.env.NEXT_PUBLIC_FACEBOOK_URL) {
    sameAs.push(process.env.NEXT_PUBLIC_FACEBOOK_URL);
  }

  const displayEmail = process.env.NEXT_PUBLIC_SALON_EMAIL?.trim() || t.displayEmail;
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || null;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;
  const wechatId = getWeChatId();

  const productsPath = localeHref(locale, "products");
  const homePath = localeHref(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: locale === "zh-HK" ? t.brandName : "n_nsalon (藝能美髮培訓中心)",
    address: {
      "@type": "PostalAddress",
      streetAddress: t.address,
      addressLocality: "Macau",
      addressCountry: "MO",
    },
    telephone: phoneToE164(t.phone),
    url: businessSite,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    areaServed: { "@type": "Place", name: "Macau" },
  };

  return (
    <div
      id="main-content"
      lang={locale}
      tabIndex={-1}
      className="min-h-screen bg-zinc-50 text-zinc-900 pb-28 [padding-bottom:max(7rem,env(safe-area-inset-bottom,0px))] sm:pb-32"
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
      <main>
        <nav
          className="border-b border-zinc-200/80 bg-white"
          aria-label="Breadcrumb"
        >
          <div className="mx-auto max-w-6xl px-4 py-3 text-sm sm:px-6">
            <Link href={homePath} className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline">
              {t.navHome}
            </Link>
            <span className="text-zinc-400" aria-hidden>
              {" "}
              /{" "}
            </span>
            <span className="text-zinc-900">{t.shopSectionTitle}</span>
          </div>
        </nav>

        <section
          id="shop"
          className="border-b border-neutral-200/90 bg-gradient-to-b from-zinc-100 via-white to-zinc-50 text-zinc-900"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h1 className="heading-section text-zinc-900">{t.shopSectionTitle}</h1>
            <p className="mt-4 max-w-measure text-base leading-cjk text-zinc-600">
              {t.shopSectionNote}
            </p>

            <ShopCheckout
              locale={locale}
              copy={pickShopCheckoutCopy(t)}
              initialProducts={initialProducts}
              orderHelpWeChatId={wechatId}
              orderHelpEmail={displayEmail}
            />
          </div>
        </section>
      </main>
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
      />
    </div>
  );
}
