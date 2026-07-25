import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ShopCheckout } from "@/components/shop-checkout";
import { SalonTopBar } from "@/components/salon-top-bar";
import { SalonHeader } from "@/components/salon-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getHomeProducts } from "@/lib/home-data";
import { pickShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { phoneToE164 } from "@/lib/tel-href";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

const display = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans-body",
});

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
  const path = `/${locale}/products`;
  const shareImage = ogImageUrl(businessSite);
  const title = `${t.shopSectionTitle} · ${t.brandName}`;
  return {
    title,
    description: t.shopSectionNote,
    openGraph: {
      title,
      description: t.shopSectionNote,
      url: `${businessSite}${path}`,
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
      canonical: `${businessSite}${path}`,
      languages: {
        "zh-HK": `${businessSite}/zh-HK/products`,
        en: `${businessSite}/en/products`,
        "x-default": `${businessSite}/zh-HK/products`,
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

  const productsPath = `/${locale}/products`;
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
        <nav
          className="border-b border-zinc-200/80 bg-white"
          aria-label="Breadcrumb"
        >
          <div className={`mx-auto max-w-6xl px-4 py-3 text-sm sm:px-6 ${sansName}`}>
            <Link href={`/${locale}`} className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline">
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
            <h1 className={`${displayName} text-3xl font-semibold text-zinc-900 md:text-4xl`}>
              {t.shopSectionTitle}
            </h1>
            <p className={`${sansName} mt-3 max-w-2xl text-sm text-zinc-500`}>{t.shopSectionNote}</p>

            <ShopCheckout
              locale={locale}
              copy={pickShopCheckoutCopy(t)}
              initialProducts={initialProducts}
              orderHelpWhatsappUrl={whatsappUrl}
              orderHelpEmail={displayEmail}
            />
          </div>
        </section>
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
