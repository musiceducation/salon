import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TonsoTeeFlyer } from "@/components/tonso-tee-flyer";
import { SalonPageShell } from "@/components/salon-page-shell";
import { shopCatalogSkus, staticCatalogId } from "@/data/shop-catalog-static";
import { getMessages, isSupportedLocale, supportedLocales, type Locale } from "@/lib/i18n";
import { localeAbsoluteUrl } from "@/lib/locale-path";
import { getProductDetailContent } from "@/lib/shop-product-detail";
import { buildSalonJsonLd, getSalonChrome, siteOrigin } from "@/lib/salon-site";
import { TONSO_TEE_CANONICAL_URL, TONSO_TEE_PHOTOS, TONSO_TEE_SLUG } from "@/lib/tonso-tee";

export const dynamicParams = false;

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale, slug: TONSO_TEE_SLUG }));
}

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function teeSku() {
  return shopCatalogSkus.find((sku) => sku.slug === TONSO_TEE_SLUG && sku.isActive);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale) || slug !== TONSO_TEE_SLUG) {
    return {};
  }
  const sku = teeSku();
  if (!sku) {
    return {};
  }
  const t = getMessages(locale);
  const titleName = locale === "zh-HK" ? sku.nameZh : sku.nameEn;
  const title = `${titleName} · ${t.brandName}`;
  const description = locale === "zh-HK" ? sku.description : sku.nameEn;
  const pageUrl = localeAbsoluteUrl(siteOrigin(), locale, `products/${TONSO_TEE_SLUG}`);
  const shareImage = `${siteOrigin()}${TONSO_TEE_PHOTOS[0].src}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "n_nsalon",
      images: [{ url: shareImage, alt: titleName }],
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
        "zh-HK": localeAbsoluteUrl(siteOrigin(), "zh-HK", `products/${TONSO_TEE_SLUG}`),
        en: localeAbsoluteUrl(siteOrigin(), "en", `products/${TONSO_TEE_SLUG}`),
        "x-default": TONSO_TEE_CANONICAL_URL,
      },
    },
  };
}

export default async function TonsoTeeProductPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isSupportedLocale(localeParam) || slug !== TONSO_TEE_SLUG) {
    notFound();
  }
  const sku = teeSku();
  if (!sku) {
    notFound();
  }
  const locale = localeParam as Locale;
  const t = getMessages(locale);
  const detail = getProductDetailContent(staticCatalogId(sku.slug), "apparel", locale, {
    nameZh: sku.nameZh,
    nameEn: sku.nameEn,
  });
  const { displayEmail, facebookUrl, instagramUrl, sameAs, wechatId } = getSalonChrome(t);
  const title = locale === "zh-HK" ? sku.nameZh : sku.nameEn;
  const pageUrl = localeAbsoluteUrl(siteOrigin(), locale, `products/${TONSO_TEE_SLUG}`);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: TONSO_TEE_PHOTOS.map((photo) => `${siteOrigin()}${photo.src}`),
    description: locale === "zh-HK" ? sku.description : (detail.story?.[0] ?? sku.nameEn),
    color: locale === "zh-HK" ? "啞黑" : "Matte black",
    sku: TONSO_TEE_SLUG,
    brand: { "@type": "Brand", name: "n_nsalon" },
    offers: {
      "@type": "Offer",
      priceCurrency: "MOP",
      price: (sku.priceCents / 100).toFixed(0),
      availability: "https://schema.org/InStock",
      url: pageUrl,
    },
  };

  return (
    <SalonPageShell
      locale={locale}
      t={t}
      displayEmail={displayEmail}
      wechatId={wechatId}
      facebookUrl={facebookUrl}
      instagramUrl={instagramUrl}
      jsonLd={buildSalonJsonLd(locale, t, sameAs)}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <main>
        <TonsoTeeFlyer
          locale={locale}
          title={title}
          priceCents={sku.priceCents}
          story={detail.story ?? []}
          care={detail.howToUse}
        />
      </main>
    </SalonPageShell>
  );
}
