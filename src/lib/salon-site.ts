import type { Locale, Messages } from "@/lib/i18n";
import { phoneToE164 } from "@/lib/tel-href";

const businessSite = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Same asset as hero (`public/ad-stock/03-salon-interior-wide.jpg`). */
export function ogImageUrl(siteBase: string = businessSite) {
  return `${siteBase}/ad-stock/03-salon-interior-wide.jpg`;
}

export function buildWhatsappUrl(): string | null {
  if (process.env.NEXT_PUBLIC_WHATSAPP_URL) {
    return process.env.NEXT_PUBLIC_WHATSAPP_URL;
  }
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "");
  if (!raw) {
    return null;
  }
  const withCc = raw.startsWith("853") ? raw : `853${raw.replace(/^0+/, "")}`;
  return `https://wa.me/${withCc}`;
}

export function buildWaDisplay(t: Messages): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\s/g, "")?.trim() || `+853 ${t.phone}`;
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

export function buildSalonJsonLd(locale: Locale, t: Messages, sameAs: string[]) {
  return {
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
}

export function whatsappBottomPaddingClass(hasWhatsapp: boolean): string {
  return hasWhatsapp
    ? " pb-28 [padding-bottom:max(7rem,env(safe-area-inset-bottom,0px))] sm:pb-32"
    : "";
}

export function buildFooterProps(
  t: Messages,
  sansClassName: string,
  options: {
    whatsappUrl: string | null;
    waDisplay: string;
    facebookUrl: string | null;
    instagramUrl: string | null;
    displayEmail: string;
  },
) {
  return {
    sansClassName,
    tagline: t.footerTagline,
    logoPrimary: t.footerLogoPrimary,
    logoSub: t.footerLogoSub,
    contactHeading: t.footerContactHeading,
    emailLinePrefix: t.emailLinePrefix,
    telLinePrefix: t.telLinePrefix,
    whatsappLabel: t.contactWhatsappLabel,
    address: t.address,
    phone: t.phone,
    email: options.displayEmail,
    hoursTitle: t.hoursFooterTitle,
    hoursDetail: t.hoursDetail,
    whatsappUrl: options.whatsappUrl,
    waDisplay: options.waDisplay,
    facebookUrl: options.facebookUrl,
    instagramUrl: options.instagramUrl,
  };
}
