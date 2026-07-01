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
import { salonDisplayClassName, salonSansClassName } from "@/lib/salon-fonts";
import {
  buildDisplayEmail,
  buildFooterProps,
  buildSalonJsonLd,
  buildSocialUrls,
  buildWaDisplay,
  buildWhatsappUrl,
  ogImageUrl,
  whatsappBottomPaddingClass,
} from "@/lib/salon-site";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import { getHomeSlotsForService } from "@/lib/home-data";

const BookingForm = dynamic(
  () => import("@/components/booking-form").then((m) => ({ default: m.BookingForm })),
  {
    loading: () => (
      <p className={`${salonSansClassName} mt-8 text-sm text-zinc-500`}>Loading booking form…</p>
    ),
  },
);

/** Prebuild both locales; required for `output: 'export'` (GitHub Pages) and static HTML at deploy. */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const defaultService = "haircut";
const businessSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  const { sameAs, facebookUrl, instagramUrl } = buildSocialUrls();
  const displayEmail = buildDisplayEmail(t);
  const whatsappUrl = buildWhatsappUrl();
  const waDisplay = buildWaDisplay(t);
  const jsonLd = buildSalonJsonLd(locale, t, sameAs);
  const bookingNoSlotsHint = t.bookingNoSlotsLine.replace("{phone}", t.phone);

  return (
    <div
      id="main-content"
      tabIndex={-1}
      className={`min-h-screen bg-zinc-50 text-zinc-900${whatsappBottomPaddingClass(Boolean(whatsappUrl))}`}
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
          displayClassName={salonDisplayClassName}
          sansClassName={salonSansClassName}
        />

        <section id="story" className="border-b border-zinc-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className={`${salonDisplayClassName} text-3xl font-semibold text-zinc-900 md:text-4xl`}>
              {t.storyTitle}
            </h2>
            <p
              className={`${salonSansClassName} mt-6 max-w-2xl whitespace-pre-line text-base leading-relaxed text-zinc-600`}
            >
              {t.storyBody}
            </p>
          </div>
        </section>

        <section id="services" className="border-b border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className={`${salonDisplayClassName} text-3xl font-semibold text-zinc-900 md:text-4xl`}>
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
                  <h3 className={`${salonDisplayClassName} text-xl font-semibold text-zinc-900`}>{item.title}</h3>
                  <p className={`${salonSansClassName} mt-4 text-sm leading-relaxed text-zinc-600`}>
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
          sansClassName={salonSansClassName}
        />

        <section id="booking" className="border-b border-zinc-800/60 bg-zinc-950 text-zinc-100">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className={`${salonDisplayClassName} text-3xl font-semibold text-white md:text-4xl`}>
              {t.bookingTitle}
            </h2>
            <p className={`${salonSansClassName} mt-3 max-w-2xl text-zinc-400`}>{t.bookingFlow}</p>
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
          displayClassName={salonDisplayClassName}
          sansClassName={salonSansClassName}
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
          sansClassName={salonSansClassName}
        />
      ) : null}
      <SiteFooter
        {...buildFooterProps(t, salonSansClassName, {
          whatsappUrl,
          waDisplay,
          facebookUrl,
          instagramUrl,
          displayEmail,
        })}
      />
    </div>
  );
}
