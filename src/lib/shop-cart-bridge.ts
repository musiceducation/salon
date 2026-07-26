/** Cross-component bridge for header cart badge ↔ shop drawer (same tab). */

export const SHOP_CART_STORAGE_KEY = "nnsalon-shop-cart-v1";
export const SHOP_CART_CHANGE_EVENT = "nnsalon:shop-cart-change";
export const SHOP_CART_OPEN_EVENT = "nnsalon:shop-cart-open";
export const SHOP_SEARCH_FOCUS_EVENT = "nnsalon:shop-search-focus";

/** @deprecated Aliases — prefer SHOP_CART_* / SHOP_SEARCH_* names. */
export const SHOP_OPEN_CART = SHOP_CART_OPEN_EVENT;
export const SHOP_FOCUS_SEARCH = SHOP_SEARCH_FOCUS_EVENT;
export const SHOP_CART_CHANGED = SHOP_CART_CHANGE_EVENT;

export type ShopCartSnapshot = {
  productId: string;
  quantity: number;
} | null;

export type ShopCartChangedDetail = {
  count: number;
  touched: boolean;
  productId?: string;
};

export function readShopCart(): ShopCartSnapshot {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {
      productId?: unknown;
      quantity?: unknown;
      count?: unknown;
      touched?: unknown;
    };
    if (typeof parsed.productId !== "string" || !parsed.productId) {
      return null;
    }
    const quantity = Number(parsed.quantity ?? parsed.count);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return null;
    }
    return { productId: parsed.productId, quantity: Math.min(10, Math.floor(quantity)) };
  } catch {
    return null;
  }
}

export function readShopCartDetail(): ShopCartChangedDetail {
  const cart = readShopCart();
  if (!cart) {
    return { count: 0, touched: false };
  }
  return { count: cart.quantity, touched: true, productId: cart.productId };
}

export function publishShopCart(cart: ShopCartSnapshot) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (cart) {
      sessionStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      sessionStorage.removeItem(SHOP_CART_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(SHOP_CART_CHANGE_EVENT, { detail: cart }));
}

export function dispatchShopCartChanged(detail: ShopCartChangedDetail) {
  if (detail.touched && detail.count > 0 && detail.productId) {
    publishShopCart({ productId: detail.productId, quantity: detail.count });
  } else {
    publishShopCart(null);
  }
}

export function requestOpenShopCart() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(SHOP_CART_OPEN_EVENT));
}

export function requestFocusShopSearch() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(SHOP_SEARCH_FOCUS_EVENT));
}

export const dispatchShopOpenCart = requestOpenShopCart;
export const dispatchShopFocusSearch = requestFocusShopSearch;
