/**
 * Shop payment methods — Macau local (manual review) first; card optional later.
 * Public account strings use NEXT_PUBLIC_* so static export can show pay-to details.
 */

/** All local methods accepted by the API / stored on orders (legacy UEPAY / bank transfer kept). */
export const LOCAL_SHOP_PAYMENT_METHODS = [
  "mpay",
  "boc",
  "uepay",
  "bank_transfer",
] as const;

export type LocalShopPaymentMethod = (typeof LOCAL_SHOP_PAYMENT_METHODS)[number];

/** Methods shown in the checkout picker — MPay + 中銀 only until UEPAY is configured. */
export const CHECKOUT_PAYMENT_METHODS = ["mpay", "boc"] as const satisfies readonly LocalShopPaymentMethod[];

export const SHOP_PAYMENT_METHODS = [...LOCAL_SHOP_PAYMENT_METHODS, "stripe_card"] as const;

export type CheckoutPaymentMethod = (typeof CHECKOUT_PAYMENT_METHODS)[number];
export type ShopPaymentMethod = (typeof SHOP_PAYMENT_METHODS)[number];

/** Salon MPay merchant ID (public — also on collection QR poster). */
export const DEFAULT_MPAY_ACCOUNT = "888537230267756";

/** 中銀澳門儲蓄戶 (public — shown at checkout). */
export const DEFAULT_BOC_ACCOUNT = "澳門儲蓄戶 181301100827421";

/** Card / Stripe is off until NEXT_PUBLIC_ENABLE_CARD_CHECKOUT=true. Never on static export. */
export function isCardCheckoutEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1") {
    return false;
  }
  return process.env.NEXT_PUBLIC_ENABLE_CARD_CHECKOUT === "true";
}

function uepayConfigured(): boolean {
  const v = process.env.NEXT_PUBLIC_UEPAY_ACCOUNT ?? process.env.UEPAY_ACCOUNT ?? "";
  return v.length > 0 && !v.startsWith("UEPAY-NNSALON");
}

/** Methods shown in the payment picker (manual-first; MPay + BOC by default). */
export function visibleShopPaymentMethods(): readonly ShopPaymentMethod[] {
  const methods: ShopPaymentMethod[] = [...CHECKOUT_PAYMENT_METHODS];
  if (uepayConfigured()) {
    methods.push("uepay");
  }
  if (isCardCheckoutEnabled()) {
    methods.push("stripe_card");
  }
  return methods;
}

/** Normalize client/API payload to an allowed checkout method. */
export function resolveCheckoutPaymentMethod(raw: string | undefined): ShopPaymentMethod {
  const visible = visibleShopPaymentMethods();
  if (raw && isShopPaymentMethod(raw) && visible.includes(raw)) {
    return raw;
  }
  return defaultCheckoutPaymentMethod();
}

export function defaultCheckoutPaymentMethod(): CheckoutPaymentMethod {
  return CHECKOUT_PAYMENT_METHODS[0];
}

export function isShopPaymentMethod(value: string): value is ShopPaymentMethod {
  return (SHOP_PAYMENT_METHODS as readonly string[]).includes(value);
}

export function isLocalShopPaymentMethod(value: string): value is LocalShopPaymentMethod {
  return (LOCAL_SHOP_PAYMENT_METHODS as readonly string[]).includes(value);
}

/** Short labels for the payment picker (match marketing copy). */
export function paymentMethodLabel(method: ShopPaymentMethod, locale: string): string {
  const zh = locale === "zh-HK";
  switch (method) {
    case "mpay":
      return "MPay";
    case "boc":
      return zh ? "中銀" : "BOC Macau";
    case "uepay":
      return "UEPAY";
    case "bank_transfer":
      return zh ? "銀行轉帳" : "Bank transfer";
    case "stripe_card":
      return "Visa / Mastercard";
  }
}

export function paymentMethodAccount(method: LocalShopPaymentMethod): string {
  switch (method) {
    case "mpay":
      return (
        process.env.NEXT_PUBLIC_MPAY_ACCOUNT ??
        process.env.MPAY_ACCOUNT ??
        DEFAULT_MPAY_ACCOUNT
      );
    case "boc":
    case "bank_transfer":
      return (
        process.env.NEXT_PUBLIC_BOC_ACCOUNT ??
        process.env.BOC_ACCOUNT ??
        process.env.NEXT_PUBLIC_BANK_TRANSFER_ACCOUNT ??
        process.env.BANK_TRANSFER_ACCOUNT ??
        DEFAULT_BOC_ACCOUNT
      );
    case "uepay":
      return (
        process.env.NEXT_PUBLIC_UEPAY_ACCOUNT ??
        process.env.UEPAY_ACCOUNT ??
        "UEPAY-NNSALON-001"
      );
  }
}

/** Optional on-site collection QR (MPay poster covers AlipayHK / WeChat / Simple Pay). */
export function paymentMethodQrSrc(method: ShopPaymentMethod): string | null {
  if (method === "mpay") {
    return "/shop/mpay-collection-qr.jpg";
  }
  return null;
}

export function paymentMethodNote(method: ShopPaymentMethod, locale: string): string {
  const zh = locale === "zh-HK";
  switch (method) {
    case "mpay":
      return zh
        ? "請用 MPay／聚易用／支付寶／微信支付掃描收款碼，或轉帳至下列商戶編號，並保留截圖。"
        : "Scan the collection QR with MPay / Simple Pay / Alipay / WeChat Pay, or transfer to the merchant ID below, and keep a screenshot.";
    case "boc":
      return zh
        ? "請用中銀手機銀行轉帳至下列澳門儲蓄戶，並保留收據截圖。"
        : "Transfer via BOC mobile banking to the Macau savings account below and keep the receipt.";
    case "uepay":
      return zh
        ? "請用 UEPAY 轉帳至下列商戶，備註填寫訂單編號。"
        : "Pay with UEPAY to the merchant below; put the order ID in the transfer note.";
    case "bank_transfer":
      return zh
        ? "請銀行轉帳至下列中銀澳門帳號，完成後上傳／傳送付款截圖以供核對。"
        : "Bank transfer to the BOC Macau account below, then send a payment screenshot for review.";
    case "stripe_card":
      return zh
        ? "Visa / Mastercard：有付款系統時會導向安全刷卡頁；靜態網頁請於 WeChat／電郵落單後由店方安排。"
        : "Visa / Mastercard: secure Stripe checkout when the API is available; on the static site, order via WeChat/email and we’ll arrange card payment.";
  }
}

export type LocalPaymentInstructions = {
  account: string;
  note: string;
};

/** Resolve pay-to account for a local method; null for card checkout. */
export function localPaymentAccount(method: ShopPaymentMethod): string | null {
  if (!isLocalShopPaymentMethod(method)) {
    return null;
  }
  return paymentMethodAccount(method);
}

/** Server checkout — store note in the customer's locale; admin UI can still read English fields. */
export function localPaymentInstructions(
  method: LocalShopPaymentMethod,
  locale = "en",
): LocalPaymentInstructions {
  return {
    account: paymentMethodAccount(method),
    note: paymentMethodNote(method, locale),
  };
}
