import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { HeroSalon } from "@/components/hero-salon";
import { SalonPageShell } from "@/components/salon-page-shell";
import { ShopPromoBanner } from "@/components/shop-promo-banner";
import { PriceListSection } from "@/components/price-list-section";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import { localeAbsoluteUrl, localeHref } from "@/lib/locale-path";
import { buildTelHref } from "@/lib/tel-href";
import {
  buildSalonJsonLd,
  getSalonChrome,
  ogImageUrl,
  siteOrigin,
} from "@/lib/salon-site";

/** Below-fold client island — keep off the initial home JS path. */
const ContactCta = dynamic(() =>
  import("@/components/contact-cta").then((m) => m.ContactCta),
);

/** Prebuild both locales; required for `output: 'export'` (GitHub Pages) and static HTML at deploy. */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const businessSite = siteOrigin();

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
  const productsPath = localeHref(locale, "products");
  const { displayEmail, facebookUrl, instagramUrl, sameAs, wechatId } = getSalonChrome(t);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "n_nsalon",
      alternateName: ["藝能美髮培訓中心", "www.nnsalon.com"],
      url: businessSite,
      inLanguage: [locale, "zh-HK", "en"],
    },
    buildSalonJsonLd(locale, t, sameAs),
  ];

  return (
    <SalonPageShell
      locale={locale}
      t={t}
      displayEmail={displayEmail}
      wechatId={wechatId}
      facebookUrl={facebookUrl}
      instagramUrl={instagramUrl}
      jsonLd={jsonLd}
    >
      <main>
        <HeroSalon
          brandTitle={t.brandTitle}
          brandSubtitle={t.brandSubtitle}
          kw1={t.heroKwHairCare}
          kw2={t.heroKwSkillful}
          kw3={t.heroKwSince}
          contactCta={t.contactCta}
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

        <section
          id="contact"
          className="scroll-mt-20 border-b border-zinc-800/60 bg-zinc-950 text-zinc-100 sm:scroll-mt-24"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="heading-section text-white">{t.contactCtaTitle}</h2>
            <p className="mt-4 max-w-measure text-base leading-cjk text-zinc-400">{t.contactCtaBody}</p>
            <ContactCta
              hoursLabel={t.contactCtaHoursLabel}
              hoursDetail={t.hoursDetail}
              wechatLabel={t.contactWechatLabel}
              wechatId={wechatId}
              wechatHint={t.contactCtaWechatHint}
              wechatCopied={t.wechatIdCopied}
              instagramLabel={t.contactInstagramLabel}
              instagramUrl={instagramUrl}
              phoneLabel={t.contactPhoneLabel}
              phoneDisplay={t.phone}
              phoneTelHref={buildTelHref(t.phone)}
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
    </SalonPageShell>
  );
}
