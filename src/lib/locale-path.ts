import { isSupportedLocale, type Locale } from "@/lib/i18n";

/** Public site default — served at `/` with no locale segment in the URL. */
export const DEFAULT_LOCALE: Locale = "zh-HK";

/** `""` for zh-HK, `"/en"` for English. */
export function localePrefix(locale: string): string {
  if (!isSupportedLocale(locale) || locale === DEFAULT_LOCALE) {
    return "";
  }
  return `/${locale}`;
}

/**
 * Public href for a locale page.
 * @example localeHref("zh-HK") → "/"
 * @example localeHref("zh-HK", "products") → "/products"
 * @example localeHref("en", "products") → "/en/products"
 */
export function localeHref(locale: string, path = ""): string {
  const prefix = localePrefix(locale);
  const rest = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!prefix && !rest) {
    return "/";
  }
  if (!rest) {
    return prefix || "/";
  }
  return `${prefix}/${rest}`;
}

/** Absolute URL for canonical / hreflang / sitemap (no trailing slash except site root). */
export function localeAbsoluteUrl(siteBase: string, locale: string, path = ""): string {
  const base = siteBase.replace(/\/+$/, "");
  const href = localeHref(locale, path);
  if (href === "/") {
    return `${base}/`;
  }
  return `${base}${href}`;
}
