"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeHref } from "@/lib/locale-path";

function useWindowHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") {
        return;
      }
      setHash(window.location.hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);
  return hash;
}

type LinkProps = {
  href: string;
  className: string;
  classNameActive: string;
  children: React.ReactNode;
  /** Only for the home path: active when there is no #section in the URL. */
  activeOnlyWithoutHash?: boolean;
};

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function HashOrLocaleLink(p: LinkProps) {
  const hash = useWindowHash();
  const pathname = normalizePath(usePathname());
  if (p.href.startsWith("#")) {
    const active = hash === p.href;
    return (
      <a
        href={p.href}
        className={active ? p.classNameActive : p.className}
      >
        {p.children}
      </a>
    );
  }

  const hashIdx = p.href.indexOf("#");
  if (hashIdx !== -1) {
    const pathPart = normalizePath(p.href.slice(0, hashIdx));
    const frag = p.href.slice(hashIdx);
    const pathMatches = pathname === pathPart;
    const active = pathMatches && hash === frag;
    return (
      <Link href={p.href} className={active ? p.classNameActive : p.className}>
        {p.children}
      </Link>
    );
  }

  const target = normalizePath(p.href);
  const pathMatches = pathname === target;
  const active = p.activeOnlyWithoutHash
    ? pathMatches && (hash === "" || hash === "#")
    : pathMatches;
  return (
    <Link href={p.href} className={active ? p.classNameActive : p.className}>
      {p.children}
    </Link>
  );
}

type Nav = {
  locale: string;
  home: string;
  priceList: string;
  contact: string;
  shop: string;
  /** Product / shop route (not a hash). */
  shopPath: string;
  baseClass: string;
  activeClass: string;
};

/**
 * W52-style nav: uppercase, underline for section matching current URL hash.
 */
export function SalonHeaderPrimaryNav(t: Nav) {
  const homePath = localeHref(t.locale);

  return (
    <nav
      className="hidden items-center gap-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 md:flex"
      aria-label="Primary"
    >
      <HashOrLocaleLink
        href={homePath}
        className={t.baseClass}
        classNameActive={t.activeClass}
        activeOnlyWithoutHash
      >
        {t.home}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href={`${homePath}#price-list`}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.priceList}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href={`${homePath}#contact`}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.contact}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href={t.shopPath}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.shop}
      </HashOrLocaleLink>
    </nav>
  );
}

export function SalonHeaderMobileNav(t: Nav & { rowClassName: string }) {
  const homePath = localeHref(t.locale);
  return (
    <div className={t.rowClassName}>
      <HashOrLocaleLink
        href={homePath}
        className={t.baseClass}
        classNameActive={t.activeClass}
        activeOnlyWithoutHash
      >
        {t.home}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href={`${homePath}#price-list`}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.priceList}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href={`${homePath}#contact`}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.contact}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href={t.shopPath}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.shop}
      </HashOrLocaleLink>
    </div>
  );
}
