import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { HeroSalon } from "@/components/hero-salon";
import { SalonTopBar } from "@/components/salon-top-bar";
import { SalonHeader } from "@/components/salon-header";
import { ShopPromoBanner } from "@/components/shop-promo-banner";
import { PriceListSection } from "@/components/price-list-section";
import { SiteFooter } from "@/components/site-footer";
import { WeChatFloat } from "@/components/wechat-float";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import { getHomeSlotsForService } from "@/lib/home-data";
import { getWeChatId } from "@/lib/contact-wechat";
import { localeAbsoluteUrl, localeHref } from "@/lib/locale-path";
import { phoneToE164 } from "@/lib/tel-href";

/** Prebuild both locales; required for `output: 'export'` (GitHub Pages) and static HTML at deploy. */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** Below-fold client island — keep off the initial home JS path. */
const BookingForm = dynamic(() =>
  import("@/components/booking-form").then((m) => m.BookingForm),
);

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const defaultService = "haircut";
const businessSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Same asset as hero (`public/ad-stock/03-salon-interior-wide.webp`). */
function ogImageUrl(siteBase: string) {
  return `${siteBase}/ad-stock/03-salon-interior-wide.webp`;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }
  const t = getMessages(locale);
  const pageUrl = localeAbsoluteUrl(businessSite, locale);
  const shareImage = ogImageUrl(businessSite);
  const title =
    locale === "zh-HK"
      ? `${t.brandName} n_nsalon｜澳門美髮`
      : `${t.brandName}｜Hair salon in Macau`;
  const description =
    locale === "zh-HK"
      ? `${t.brandSubtitle} 官方網站 www.nnsalon.com。`
      : `${t.brandSubtitle} Official site: www.nnsalon.com.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "n_nsalon",
      images: [
        {
          url: shareImage,
          width: 1600,
          height: 1200,
          alt: t.brandTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        "zh-HK": localeAbsoluteUrl(businessSite, "zh-HK"),
        en: localeAbsoluteUrl(businessSite, "en"),
        "x-default": localeAbsoluteUrl(businessSite, "zh-HK"),
      },
    },
  };
}

export default async function LocaleHomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const initialSlots = await getHomeSlotsForService(locale, defaultService);
  const productsPath = localeHref(locale, "products");

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

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "n_nsalon",
      alternateName: ["藝能美髮培訓中心", "www.nnsalon.com"],
      url: businessSite,
      inLanguage: [locale, "zh-HK", "en"],
    },
    {
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: locale === "zh-HK" ? t.brandName : "n_nsalon (藝能美髮培訓中心)",
      alternateName: locale === "zh-HK" ? ["n_nsalon", "www.nnsalon.com"] : ["藝能美髮培訓中心", "www.nnsalon.com"],
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
    },
  ];

  const bookingNoSlotsHint = t.bookingNoSlotsLine
    .replace("{phone}", t.phone)
    .replace("{wechat}", wechatId);

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
        <HeroSalon
          brandTitle={t.brandTitle}
          brandSubtitle={t.brandSubtitle}
          kw1={t.heroKwHairCare}
          kw2={t.heroKwSkillful}
          kw3={t.heroKwSince}
          bookNow={t.bookNow}
          shopNow={t.shopNow}
          shopHref={productsPath}
        />

        <section id="story" className="border-b border-zinc-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="heading-section text-zinc-900">{t.storyTitle}</h2>
            <div className="mt-6 max-w-measure space-y-5 text-base leading-cjk text-zinc-600">
              {t.storyBody.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 12)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="border-b border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="heading-section text-zinc-900">{t.servicesSectionTitle}</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { title: t.serviceCutTitle, body: t.serviceCutBody },
                { title: t.serviceTechTitle, body: t.serviceTechBody },
                { title: t.serviceCareTitle, body: t.serviceCareBody },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group border border-zinc-200/90 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-md"
                >
                  <h3 className="heading-card text-zinc-900">{item.title}</h3>
                  <p className="mt-4 text-sm leading-cjk text-zinc-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ShopPromoBanner
          title={t.shopBannerTitle}
          body={t.shopBannerBody}
          cta={t.shopBannerCta}
          ctaHref={productsPath}
        />

        <section id="booking" className="border-b border-zinc-800/60 bg-zinc-950 text-zinc-100">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="heading-section text-white">{t.bookingTitle}</h2>
            <p className="mt-4 max-w-measure text-base leading-cjk text-zinc-400">{t.bookingFlow}</p>
            <BookingForm
              locale={locale}
              initialSlots={initialSlots}
              defaultServiceId={defaultService}
              noSlotsHint={bookingNoSlotsHint}
              wechatId={wechatId}
              phoneDisplay={t.phone}
              phoneTelHref={`tel:${phoneToE164(t.phone)}`}
              staticNote={t.bookingStaticNote}
              staticCta={t.bookingStaticCta}
              staticCopied={t.bookingStaticCopied}
            />
          </div>
        </section>

        <PriceListSection
          locale={locale}
          priceListTitle={t.priceListTitle}
          intro={t.priceListIntro}
          disclaimer={t.priceListDisclaimer}
        />
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
