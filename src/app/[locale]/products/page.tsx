import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopCheckout } from "@/components/shop-checkout";
import { SalonTopBar } from "@/components/salon-top-bar";
import { SalonHeader } from "@/components/salon-header";
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
import type { Locale } from "@/lib/i18n";
import { getHomeProducts } from "@/lib/home-data";
import { pickShopCheckoutCopy } from "@/lib/shop-checkout-copy";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

const businessSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  const { sameAs, facebookUrl, instagramUrl } = buildSocialUrls();
  const displayEmail = buildDisplayEmail(t);
  const whatsappUrl = buildWhatsappUrl();
  const waDisplay = buildWaDisplay(t);
  const productsPath = `/${locale}/products`;
  const jsonLd = buildSalonJsonLd(locale, t, sameAs);

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
        <nav
          className="border-b border-zinc-200/80 bg-white"
          aria-label="Breadcrumb"
        >
          <div className={`mx-auto max-w-6xl px-4 py-3 text-sm sm:px-6 ${salonSansClassName}`}>
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
            <h1 className={`${salonDisplayClassName} text-3xl font-semibold text-zinc-900 md:text-4xl`}>
              {t.shopSectionTitle}
            </h1>
            <p className={`${salonSansClassName} mt-3 max-w-2xl text-sm text-zinc-500`}>{t.shopSectionNote}</p>

            <ShopCheckout
              locale={locale}
              copy={pickShopCheckoutCopy(t)}
              initialProducts={initialProducts}
            />
          </div>
        </section>
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
