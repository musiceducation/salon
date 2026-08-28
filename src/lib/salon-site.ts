import type { Locale, Messages } from "@/lib/i18n";
import { getWeChatId } from "@/lib/contact-wechat";
import { phoneToE164 } from "@/lib/tel-href";

const businessSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Header/footer mark — 180×180 JPEG (~13KB) instead of the 886px `logo.jpg` (~214KB). */
export const SALON_LOGO_SRC = "/brand/logo-180.jpg";

/** Same asset as the hero (`public/ad-stock/03-salon-interior-wide.webp`). */
export function ogImageUrl(siteBase: string = businessSite) {
  return `${siteBase}/ad-stock/03-salon-interior-wide.webp`;
}

export function siteOrigin() {
  return businessSite;
}

export function buildDisplayEmail(t: Messages): string {
  return process.env.NEXT_PUBLIC_SALON_EMAIL?.trim() || t.displayEmail;
}

export function buildSocialUrls() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || null;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;
  const sameAs: string[] = [];
  if (instagramUrl) {
    sameAs.push(instagramUrl);
  }
  if (facebookUrl) {
    sameAs.push(facebookUrl);
  }
  return { facebookUrl, instagramUrl, sameAs };
}

export function getSalonChrome(t: Messages) {
  const displayEmail = buildDisplayEmail(t);
  const { facebookUrl, instagramUrl, sameAs } = buildSocialUrls();
  return {
    displayEmail,
    facebookUrl,
    instagramUrl,
    sameAs,
    wechatId: getWeChatId(),
  };
}

export function buildSalonJsonLd(locale: Locale, t: Messages, sameAs: string[]) {
  return {
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
  };
}

export const salonFloatPaddingClass =
  "pb-28 [padding-bottom:max(7rem,env(safe-area-inset-bottom,0px))] sm:pb-32";
