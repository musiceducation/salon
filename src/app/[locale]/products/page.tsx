import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopCheckout } from "@/components/shop-checkout";
import { SalonPageShell } from "@/components/salon-page-shell";
import { getMessages, isSupportedLocale, supportedLocales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getHomeProducts } from "@/lib/home-data";
import { pickShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { localeAbsoluteUrl, localeHref } from "@/lib/locale-path";
import {
  buildSalonJsonLd,
  getSalonChrome,
  ogImageUrl,
  siteOrigin,
} from "@/lib/salon-site";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

const businessSite = siteOrigin();

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
  const { displayEmail, facebookUrl, instagramUrl, sameAs, wechatId } = getSalonChrome(t);
  const homePath = localeHref(locale);
  const jsonLd = buildSalonJsonLd(locale, t, sameAs);

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
    </SalonPageShell>
  );
}
