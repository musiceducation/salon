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
        <nav className="bg-[#09090b]" aria-label="Breadcrumb">
          <div className="mx-auto max-w-6xl px-4 py-3 text-xs tracking-wide sm:px-6">
            <Link href={homePath} className="text-stone-500 underline-offset-4 hover:text-stone-100 hover:underline">
              {t.navHome}
            </Link>
            <span className="text-stone-600" aria-hidden>
              {" "}
              /{" "}
            </span>
            <span className="text-stone-300">{t.shopSectionTitle}</span>
          </div>
        </nav>

        <section id="shop" className="showroom-wall border-b border-white/10 text-stone-100">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
            <p className="text-[11px] tracking-[0.28em] text-stone-400">{t.heroTagline}</p>
            <h1 className="mt-4 text-sm font-medium tracking-[0.22em] text-stone-200">{t.shopSectionTitle}</h1>
            <p className="mt-8 max-w-xl text-2xl font-light leading-snug text-stone-50 sm:text-[2rem]">
              {t.shopStageCaption}
            </p>
            <p className="mt-4 max-w-xl text-xs leading-cjk text-stone-400">{t.shopSectionNote}</p>
            <div className="mt-10 h-px bg-white/10" aria-hidden />

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
