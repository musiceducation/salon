import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { HeroSalon } from "@/components/hero-salon";
import { SalonTopBar } from "@/components/salon-top-bar";
import { SalonHeader } from "@/components/salon-header";
import { ShopPromoBanner } from "@/components/shop-promo-banner";
import { PriceListSection } from "@/components/price-list-section";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import { getHomeSlotsForService } from "@/lib/home-data";
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
  const path = `/${locale}`;
  const shareImage = ogImageUrl(businessSite);
  return {
    title: t.brandName,
    description: t.brandSubtitle,
    openGraph: {
      title: t.brandName,
      description: t.brandSubtitle,
      url: `${businessSite}${path}`,
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
      title: t.brandName,
      description: t.brandSubtitle,
      images: [shareImage],
    },
    alternates: {
      canonical: `${businessSite}${path}`,
      languages: {
        "zh-HK": `${businessSite}/zh-HK`,
        en: `${businessSite}/en`,
        "x-default": `${businessSite}/zh-HK`,
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
  const productsPath = `/${locale}/products`;

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
  const whatsappUrl: string | null = (() => {
    if (process.env.NEXT_PUBLIC_WHATSAPP_URL) {
      return process.env.NEXT_PUBLIC_WHATSAPP_URL;
    }
    const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "");
    if (!raw) {
      return null;
    }
    const withCc = raw.startsWith("853") ? raw : `853${raw.replace(/^0+/, "")}`;
    return `https://wa.me/${withCc}`;
  })();

  const waDisplay =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\s/g, "")?.trim() || `+853 ${t.phone}`;

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

  const displayName = display.className;
  const sansName = sans.className;

  const bookingNoSlotsHint = t.bookingNoSlotsLine.replace("{phone}", t.phone);

  return (
    <div
      id="main-content"
      tabIndex={-1}
      className={`min-h-screen bg-zinc-50 text-zinc-900 ${display.variable} ${sans.variable} [font-family:var(--font-sans-body),ui-sans-serif,system-ui,sans-serif]${whatsappUrl ? " pb-28 [padding-bottom:max(7rem,env(safe-area-inset-bottom,0px))] sm:pb-32" : ""}`}
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
        cartCount={0}
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
          displayClassName={displayName}
          sansClassName={sansName}
        />

        <section id="story" className="border-b border-zinc-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className={`${displayName} text-3xl font-semibold text-zinc-900 md:text-4xl`}>
              {t.storyTitle}
            </h2>
            <p
              className={`${sansName} mt-6 max-w-2xl whitespace-pre-line text-base leading-relaxed text-zinc-600`}
            >
              {t.storyBody}
            </p>
          </div>
        </section>

        <section id="services" className="border-b border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className={`${displayName} text-3xl font-semibold text-zinc-900 md:text-4xl`}>
              {t.servicesSectionTitle}
            </h2>
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
                  <h3 className={`${displayName} text-xl font-semibold text-zinc-900`}>{item.title}</h3>
                  <p className={`${sansName} mt-4 text-sm leading-relaxed text-zinc-600`}>
                    {item.body}
                  </p>
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
          sansClassName={sansName}
        />

        <section id="booking" className="border-b border-zinc-800/60 bg-zinc-950 text-zinc-100">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className={`${displayName} text-3xl font-semibold text-white md:text-4xl`}>
              {t.bookingTitle}
            </h2>
            <p className={`${sansName} mt-3 max-w-2xl text-zinc-400`}>{t.bookingFlow}</p>
            <BookingForm
              locale={locale}
              initialSlots={initialSlots}
              defaultServiceId={defaultService}
              noSlotsHint={bookingNoSlotsHint}
            />
          </div>
        </section>

        <PriceListSection
          locale={locale}
          displayClassName={displayName}
          sansClassName={sansName}
          priceListTitle={t.priceListTitle}
          intro={t.priceListIntro}
          disclaimer={t.priceListDisclaimer}
        />
      </main>
      {whatsappUrl ? (
        <WhatsAppFloat
          href={whatsappUrl}
          title={t.whatsappBubbleTitle}
          body={t.whatsappBubbleBody}
          sansClassName={sansName}
        />
      ) : null}
      <SiteFooter
        sansClassName={sansName}
        tagline={t.footerTagline}
        logoPrimary={t.footerLogoPrimary}
        logoSub={t.footerLogoSub}
        contactHeading={t.footerContactHeading}
        emailLinePrefix={t.emailLinePrefix}
        telLinePrefix={t.telLinePrefix}
        whatsappLabel={t.contactWhatsappLabel}
        address={t.address}
        phone={t.phone}
        email={displayEmail}
        hoursTitle={t.hoursFooterTitle}
        hoursDetail={t.hoursDetail}
        whatsappUrl={whatsappUrl}
        waDisplay={waDisplay}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
      />
    </div>
  );
}
