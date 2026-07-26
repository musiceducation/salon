import { NextRequest, NextResponse } from "next/server";
import { computeAdminSessionValue } from "@/lib/admin-session";
import { COOKIE_NAME } from "@/lib/auth-admin";
import { DEFAULT_LOCALE } from "@/lib/locale-path";

const ADMIN_LOGIN_PATH = "/admin/login";

function timingSafeStringEq(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function getCookieValue(cookieHeader: string, name: string) {
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return undefined;
}

function isEnglishPath(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}

function isSkippedLocaleRewrite(pathname: string) {
  return (
    isEnglishPath(pathname) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Old prefixed Chinese URLs → clean public URLs (308 so SEO consolidates on /).
  if (pathname === `/${DEFAULT_LOCALE}` || pathname === `/${DEFAULT_LOCALE}/`) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Serve default locale from unprefixed paths: `/` → `/zh-HK`, `/products` → `/zh-HK/products`.
  if (!isSkippedLocaleRewrite(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const adminKey = process.env.ADMIN_API_KEY ?? "";
  if (!adminKey) {
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  const authHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (authHeader && timingSafeStringEq(authHeader, adminKey)) {
    return NextResponse.next();
  }

  const xHeader = request.headers.get("x-admin-key");
  if (xHeader && timingSafeStringEq(xHeader, adminKey)) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = getCookieValue(cookieHeader, COOKIE_NAME);
  const expected = await computeAdminSessionValue(adminKey);
  if (cookie && timingSafeStringEq(cookie, expected)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = ADMIN_LOGIN_PATH;
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Locale rewrite/redirect + admin gate.
     * Skip static assets (paths with a file extension).
     */
    "/((?!_next/static|_next/image|.*\\..*).*)",
  ],
};
