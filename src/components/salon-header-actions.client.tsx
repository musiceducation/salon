"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localeHref, pathWithoutLocale } from "@/lib/locale-path";
import {
  readShopCart,
  requestFocusShopSearch,
  requestOpenShopCart,
  SHOP_CART_CHANGE_EVENT,
  type ShopCartSnapshot,
} from "@/lib/shop-cart-bridge";

const iconSearch = (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const iconCart = (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

function isProductsPath(pathname: string) {
  return pathWithoutLocale(pathname) === "products";
}

type Props = {
  locale: string;
  searchAria: string;
  searchLabel: string;
  cartAria: string;
  cartEmpty: string;
  productsPath: string;
};

export function SalonHeaderActions({
  locale,
  searchAria,
  searchLabel,
  cartAria,
  cartEmpty,
  productsPath,
}: Props) {
  const pathname = usePathname();
  const onProducts = isProductsPath(pathname);
  const [cart, setCart] = useState<ShopCartSnapshot>(null);

  useEffect(() => {
    setCart(readShopCart());
    function onChange(e: Event) {
      const detail = (e as CustomEvent<ShopCartSnapshot>).detail;
      setCart(detail === undefined ? readShopCart() : detail);
    }
    window.addEventListener(SHOP_CART_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(SHOP_CART_CHANGE_EVENT, onChange);
  }, []);

  const count = cart?.quantity ?? 0;
  const cartLabel = count > 0 ? `${cartAria} (${count})` : cartEmpty;
  const searchHref = `${localeHref(locale, "products")}?focus=search`;
  const cartHref = `${localeHref(locale, "products")}?cart=1`;

  function handleSearchClick(e: React.MouseEvent) {
    if (!onProducts) {
      return;
    }
    e.preventDefault();
    requestFocusShopSearch();
    document.getElementById("shop-product-search")?.focus();
  }

  function handleCartClick(e: React.MouseEvent) {
    if (!onProducts) {
      return;
    }
    e.preventDefault();
    requestOpenShopCart();
  }

  return (
    <>
      <Link
        href={onProducts ? productsPath : cartHref}
        onClick={handleCartClick}
        className="group relative inline-flex items-center justify-center rounded-full p-2 text-zinc-800 transition hover:bg-zinc-100 hover:text-zinc-900"
        title={cartLabel}
        aria-label={cartLabel}
      >
        {iconCart}
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-zinc-900 px-0.5 text-[10px] font-semibold text-white">
            {count}
          </span>
        ) : null}
        <span className="sr-only">{cartLabel}</span>
      </Link>
      <span className="hidden h-4 w-px self-center bg-zinc-200 sm:block" />
      <Link
        href={searchHref}
        onClick={handleSearchClick}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
        title={searchAria}
        aria-label={searchAria}
      >
        {iconSearch}
        <span className="hidden sm:inline">{searchLabel}</span>
      </Link>
    </>
  );
}
