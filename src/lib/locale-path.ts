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

/** Strip locale prefix from a pathname → locale-neutral path segment(s). */
export function pathWithoutLocale(pathname: string): string {
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (normalized === "/en") {
    return "";
  }
  if (normalized.startsWith("/en/")) {
    return normalized.slice(4);
  }
  return normalized.replace(/^\//, "");
}

/**
 * Same page in another locale, keeping path + hash (e.g. `/products#shop` → `/en/products#shop`).
 */
export function swapLocaleHref(pathname: string, targetLocale: Locale, hash = ""): string {
  const rest = pathWithoutLocale(pathname);
  const base = localeHref(targetLocale, rest);
  const frag = hash.startsWith("#") ? hash : hash ? `#${hash}` : "";
  return `${base}${frag}`;
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
