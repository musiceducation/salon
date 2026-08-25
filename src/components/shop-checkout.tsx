"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ShopCheckoutCopy } from "@/lib/shop-checkout-copy";
import { publicAssetPath } from "@/lib/public-asset-path";
import {
  defaultCheckoutPaymentMethod,
  localPaymentAccount,
  paymentMethodLabel,
  paymentMethodNote,
  paymentMethodQrSrc,
  resolveCheckoutPaymentMethod,
  visibleShopPaymentMethods,
  type ShopPaymentMethod,
} from "@/lib/shop-payment-methods";
import { copyTextToClipboard } from "@/lib/contact-wechat";
import {
  publishShopCart,
  readShopCart,
  SHOP_CART_OPEN_EVENT,
  SHOP_SEARCH_FOCUS_EVENT,
} from "@/lib/shop-cart-bridge";
import { ShopCartDrawer } from "@/components/shop-cart-drawer";
import { ShopProductDetailPanel } from "@/components/shop-product-detail-panel";
import { formatMoney } from "@/lib/format-money";
import { fallbackSheetOrderId, queueSpreadsheetSync } from "@/lib/spreadsheet-sync";

const CART_QTY_MAX = 10;

type Product = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
};

type ShopCheckoutProps = {
  locale: string;
  /** Server-picked copy only — keeps full `messages/*.json` off the client bundle. */
  copy: ShopCheckoutCopy;
  initialProducts: Product[];
  /** WeChat ID for static / manual orders (GitHub Pages). */
  orderHelpWeChatId?: string | null;
  orderHelpEmail?: string;
};

type PaymentMethod = ShopPaymentMethod;
type SortKey = "default" | "price-asc" | "price-desc";
type CategoryKey = "shampoo" | "conditioner" | "treatment" | "styling" | "uncategorized";
type ViewMode = "grid-3" | "grid-2" | "list";

const ALL_CATEGORY_KEYS: CategoryKey[] = ["shampoo", "conditioner", "treatment", "styling", "uncategorized"];

type LocalPaymentResponse = {
  orderId: string;
  paymentMethod: PaymentMethod;
  amountCents: number;
  currency: string;
  paymentAccount: string;
  paymentNote: string;
  message: string;
  uploadToken: string;
  proofViaWhatsapp?: boolean;
};

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidPhoneDigits(phone: string) {
  const d = digitsOnly(phone);
  return d.length >= 6 && d.length <= 15;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildStaticOrderLines(
  locale: string,
  product: Product | undefined,
  quantity: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  totalFormatted: string,
  paymentMethod: PaymentMethod,
): string {
  const pname = product ? (locale === "zh-HK" ? product.nameZh : product.nameEn) : "—";
  const payLabel = paymentMethodLabel(paymentMethod, locale);
  const payAccount = localPaymentAccount(paymentMethod);
  const accountLabel =
    locale === "zh-HK"
      ? paymentMethod === "mpay"
        ? "商戶編號"
        : "收款帳號"
      : paymentMethod === "mpay"
        ? "Merchant ID"
        : "Pay to";
  const phoneDigits = digitsOnly(customerPhone);
  if (locale === "zh-HK") {
    return [
      "【藝能網店訂購】",
      `商品：${pname} × ${quantity}`,
      `金額：${totalFormatted}`,
      `付款方式：${payLabel}`,
      payAccount ? `${accountLabel}：${payAccount}` : "",
      customerName.trim() ? `稱呼：${customerName.trim()}` : "",
      customerEmail.trim() ? `電郵：${customerEmail.trim()}` : "",
      phoneDigits ? `電話：${phoneDigits}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    "[n_nsalon web order]",
    `Item: ${pname} × ${quantity}`,
    `Total: ${totalFormatted}`,
    `Payment: ${payLabel}`,
    payAccount ? `${accountLabel}: ${payAccount}` : "",
    customerName.trim() ? `Name: ${customerName.trim()}` : "",
    customerEmail.trim() ? `Email: ${customerEmail.trim()}` : "",
    phoneDigits ? `Phone: ${phoneDigits}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `idemp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const raw = await response.text();
  if (!raw.trim()) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { message: raw.slice(0, 240) };
  }
}

function formatProductTitle(p: Product, locale: string) {
  if (locale === "zh-HK") {
    return p.nameZh;
  }
  return p.nameEn.toUpperCase();
}

function priceDisplay(cents: number, currency = "mop") {
  return formatMoney(cents, currency);
}

function inferCategoryKey(p: { nameZh: string; nameEn: string }): CategoryKey {
  const s = `${p.nameZh} ${p.nameEn}`.toLowerCase();
  if (/shampoo|洗髮|洗发/.test(s)) {
    return "shampoo";
  }
  if (/\boil\b|hair oil|髮油|发油|頭髮油|头发油|haaröl/.test(s)) {
    return "treatment";
  }
  if (/\bbalm\b|balsam|taming|順服乳霜/.test(s)) {
    return "treatment";
  }
  if (/treatment|mask|髮膜|发膜|髮朮|修護|修护|ampoule|serum|精華|精华|膜/.test(s)) {
    return "treatment";
  }
  if (/conditioner|護髮素|护发素/.test(s)) {
    return "conditioner";
  }
  if (/conditioner|護髮|护发|cream/.test(s)) {
    return "conditioner";
  }
  if (/hair growth|育髮|生髮|ahcmax/i.test(s)) {
    return "treatment";
  }
  if (/clay|髮泥|matte paste|texturising|paste/.test(s)) {
    return "styling";
  }
  if (/hairspray|mousse|spray|styling|wax|gel|造型|噴霧|啫/.test(s)) {
    return "styling";
  }
  return "uncategorized";
}

function categoryLabel(t: ShopCheckoutCopy, key: CategoryKey) {
  switch (key) {
    case "shampoo":
      return t.catShampoo;
    case "conditioner":
      return t.catConditioner;
    case "treatment":
      return t.catTreatment;
    case "styling":
      return t.catStyling;
    default:
      return t.catUncategorized;
  }
}

function paymentAccountLabel(method: PaymentMethod, t: ShopCheckoutCopy): string {
  return method === "mpay" ? t.shopPaymentMpayMerchantLabel : t.shopPaymentAccountLabel;
}

/** MPay 聚易用收款海報 — portrait 714×960, sized for mobile scan. */
function PaymentCollectionQr({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="mt-4 flex flex-col items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-3 py-4 sm:px-5 sm:py-5">
      <Image
        src={publicAssetPath(src)}
        alt={alt}
        width={714}
        height={960}
        className="h-auto w-full max-w-[280px] rounded-lg bg-white shadow-sm ring-1 ring-neutral-100 sm:max-w-[320px]"
        unoptimized
      />
      <figcaption className="mt-3 max-w-xs text-center text-xs leading-relaxed text-neutral-600 sm:max-w-sm">
        {caption}
      </figcaption>
    </figure>
  );
}

function ProductBottlePlaceholder() {
  return (
    <div
      className="flex h-28 w-16 items-end justify-center sm:h-32 sm:w-20"
      style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.08))" }}
    >
      <svg viewBox="0 0 64 120" className="h-full w-full text-neutral-300" aria-hidden>
        <rect x="18" y="0" width="28" height="10" rx="2" className="fill-current opacity-50" />
        <rect x="14" y="10" width="36" height="70" rx="4" className="fill-white stroke-neutral-200" strokeWidth="1" />
        <rect x="20" y="18" width="24" height="48" rx="1" className="fill-neutral-100" />
        <path d="M22 80 Q32 90 42 80 L40 110 Q32 115 24 110 Z" className="fill-white stroke-neutral-200" strokeWidth="1" />
      </svg>
    </div>
  );
}

function ShopProductCard({
  product,
  layout,
  isSelected,
  onViewDetail,
  onAdd,
  t,
  locale,
}: {
  product: Product;
  layout: "grid" | "list";
  isSelected: boolean;
  onViewDetail: () => void;
  onAdd: () => void;
  t: ShopCheckoutCopy;
  locale: string;
}) {
  const title = formatProductTitle(product, locale);

  if (layout === "list") {
    return (
      <article
        className={`group flex gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md ${
          isSelected ? "border-zinc-900 ring-2 ring-zinc-900/20" : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <button type="button" onClick={onViewDetail} className="w-28 shrink-0 sm:w-32">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-neutral-50">
            {product.imageUrl ? (
              <Image
                src={publicAssetPath(product.imageUrl)}
                alt=""
                width={200}
                height={200}
                className="h-full w-full object-contain p-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
                unoptimized
              />
            ) : (
              <ProductBottlePlaceholder />
            )}
          </div>
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <button type="button" onClick={onViewDetail} className="text-left">
            <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
            <p className="mt-1 text-sm text-neutral-800">{priceDisplay(product.priceCents, product.currency)}</p>
            <span className="mt-2 inline-block text-xs font-medium text-neutral-500 underline underline-offset-2">
              {t.shopViewDetails}
            </span>
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 w-fit rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-neutral-800 transition-all duration-200 ease-out hover:border-zinc-900 hover:bg-zinc-50 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            {t.shopAddToCart}
          </button>
        </div>
      </article>
    );
  }

  const imgBlockGrid = (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-t-xl bg-neutral-50">
      {product.imageUrl ? (
        <Image
          src={publicAssetPath(product.imageUrl)}
          alt=""
          width={360}
          height={360}
          className="h-full w-full object-contain p-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.03]"
          unoptimized
        />
      ) : (
        <ProductBottlePlaceholder />
      )}
    </div>
  );

  return (
    <article
      className={`group flex flex-col rounded-xl border bg-white text-center shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg ${
        isSelected
          ? "border-zinc-900 shadow-md ring-2 ring-zinc-900/20"
          : "border-neutral-100 hover:border-neutral-200"
      }`}
    >
      <button
        type="button"
        onClick={onViewDetail}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        aria-pressed={isSelected}
        aria-label={`${title} — ${t.shopViewDetails}`}
      >
        {imgBlockGrid}
        <h3 className="mt-4 line-clamp-2 px-1 text-sm font-medium leading-snug text-neutral-900">{title}</h3>
        <p className="mt-2 text-sm text-neutral-800">{priceDisplay(product.priceCents, product.currency)}</p>
        <span className="mt-2 inline-block px-1 text-xs font-medium text-neutral-500 underline underline-offset-2">
          {t.shopViewDetails}
        </span>
      </button>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 w-full rounded-b-xl border-x border-b border-neutral-200 bg-white py-2.5 text-xs font-medium uppercase tracking-wider text-neutral-800 transition-all duration-200 ease-out hover:border-zinc-900 hover:bg-zinc-50 active:scale-[0.99] motion-reduce:active:scale-100"
      >
        {t.shopAddToCart}
      </button>
    </article>
  );
}

function FilterSidebar({
  t,
  categoryOptions,
  filterCats,
  toggleFilter,
  clearFilters,
}: {
  t: ShopCheckoutCopy;
  categoryOptions: CategoryKey[];
  filterCats: CategoryKey[];
  toggleFilter: (c: CategoryKey) => void;
  clearFilters: () => void;
}) {
  const detailsClass =
    "border-b border-neutral-200 py-1 [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:content-['']";
  const summaryClass =
    "flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-800 transition-colors duration-200 ease-out hover:text-neutral-950";

  return (
    <div className="space-y-0">
      <details open className={detailsClass}>
        <summary className={summaryClass}>
          <span>
            <span className="text-neutral-500">{t.shopFilterProductTypeEn}</span>
            <span className="mx-1 text-neutral-300">·</span>
            <span>{t.shopFilterProductType}</span>
          </span>
          <span className="text-neutral-400" aria-hidden>
            ▾
          </span>
        </summary>
        <div className="space-y-2 pb-3 pl-0.5">
          <label className="flex cursor-pointer items-center gap-2 rounded-md py-0.5 text-sm text-neutral-700 transition-colors duration-150 ease-out hover:text-neutral-900">
            <input
              type="checkbox"
              className="rounded border-neutral-300 transition-colors duration-150"
              checked={filterCats.length === 0}
              onChange={() => clearFilters()}
            />
            <span>{t.shopFilterAllTypes}</span>
          </label>
          {categoryOptions.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-md py-0.5 text-sm text-neutral-700 transition-colors duration-150 ease-out hover:text-neutral-900"
            >
              <input
                type="checkbox"
                className="rounded border-neutral-300 transition-colors duration-150"
                checked={filterCats.includes(key)}
                onChange={() => toggleFilter(key)}
              />
              <span>{categoryLabel(t, key)}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}

export function ShopCheckout({
  locale,
  copy,
  initialProducts,
  orderHelpWeChatId = null,
  orderHelpEmail,
}: ShopCheckoutProps) {
  const t = copy;
  const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState(initialProducts[0]?.id ?? "");
  const [sort, setSort] = useState<SortKey>("default");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => defaultCheckoutPaymentMethod());
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [localPaymentData, setLocalPaymentData] = useState<LocalPaymentResponse | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const checkoutIdempotencyKeyRef = useRef("");
  const lastStaticSheetKeyRef = useRef("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-3");
  const [filterCats, setFilterCats] = useState<CategoryKey[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartTouched, setCartTouched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const didHydrateCartRef = useRef(false);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId),
    [products, selectedProductId],
  );

  const detailProduct = useMemo(
    () => (detailProductId ? products.find((item) => item.id === detailProductId) : undefined),
    [products, detailProductId],
  );

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sort === "price-asc") {
      list.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.priceCents - a.priceCents);
    }
    return list;
  }, [products, sort]);

  const categoryOptions = useMemo(() => {
    const s = new Set<CategoryKey>();
    products.forEach((p) => s.add(inferCategoryKey(p)));
    return ALL_CATEGORY_KEYS.filter((k) => s.has(k));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = sortedProducts;
    if (filterCats.length > 0) {
      list = list.filter((p) => filterCats.includes(inferCategoryKey(p)));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.nameZh.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q),
      );
    }
    return list;
  }, [sortedProducts, filterCats, searchQuery]);

  const totalCatalog = sortedProducts.length;
  const n = filteredProducts.length;

  function toggleFilter(cat: CategoryKey) {
    setFilterCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function clearFilters() {
    setFilterCats([]);
    setSearchQuery("");
    syncSearchParam("");
  }

  function syncSearchParam(q: string) {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    const trimmed = q.trim();
    if (trimmed) {
      url.searchParams.set("q", trimmed);
    } else {
      url.searchParams.delete("q");
    }
    url.searchParams.delete("search");
    url.searchParams.delete("focus");
    url.searchParams.delete("cart");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }

  function onSearchChange(value: string) {
    setSearchQuery(value);
    syncSearchParam(value);
  }

  useEffect(() => {
    checkoutIdempotencyKeyRef.current = createIdempotencyKey();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    if (q) {
      setSearchQuery(q);
    }
    if (params.get("focus") === "search" || params.get("search") === "1" || params.has("q")) {
      window.setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (params.get("cart") === "1") {
      setCartOpen(true);
    }
  }, []);

  useEffect(() => {
    if (didHydrateCartRef.current || products.length === 0) {
      return;
    }
    didHydrateCartRef.current = true;
    const saved = readShopCart();
    if (saved && products.some((p) => p.id === saved.productId)) {
      setSelectedProductId(saved.productId);
      setQuantity(saved.quantity);
      setCartTouched(true);
    }
  }, [products]);

  useEffect(() => {
    function onOpenCart() {
      setCartOpen(true);
    }
    function onFocusSearch() {
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    window.addEventListener(SHOP_CART_OPEN_EVENT, onOpenCart);
    window.addEventListener(SHOP_SEARCH_FOCUS_EVENT, onFocusSearch);
    return () => {
      window.removeEventListener(SHOP_CART_OPEN_EVENT, onOpenCart);
      window.removeEventListener(SHOP_SEARCH_FOCUS_EVENT, onFocusSearch);
    };
  }, []);

  useEffect(() => {
    if (cartTouched && selectedProductId) {
      publishShopCart({ productId: selectedProductId, quantity });
    }
  }, [cartTouched, selectedProductId, quantity]);

  useEffect(() => {
    const resolved = resolveCheckoutPaymentMethod(paymentMethod);
    if (resolved !== paymentMethod) {
      setPaymentMethod(resolved);
    }
  }, [paymentMethod]);

  const checkoutPaymentMethod = useMemo(
    () => resolveCheckoutPaymentMethod(paymentMethod),
    [paymentMethod],
  );

  function nextIdempotencyKey() {
    const key = createIdempotencyKey();
    checkoutIdempotencyKeyRef.current = key;
    return key;
  }

  useEffect(() => {
    if (!proofFile) {
      setProofPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  useEffect(() => {
    setProofUploaded(false);
    setProofFile(null);
  }, [localPaymentData?.orderId]);

  useEffect(() => {
    if (!localPaymentData?.orderId) {
      return;
    }
    document.getElementById("shop-local-payment")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [localPaymentData?.orderId]);

  useEffect(() => {
    if (initialProducts.length > 0) {
      return;
    }
    async function loadProducts() {
      try {
        const response = await fetch("/api/shop/products");
        const data = (await parseJsonResponse(response)) as { products?: Product[]; message?: string };
        if (data.products) {
          setProducts(data.products);
          setSelectedProductId(data.products[0]?.id ?? "");
          return;
        }
        setMessage(data.message ?? "Failed to load products.");
      } catch {
        setMessage("Could not load products. Check your connection or use the catalog above.");
      }
    }
    void loadProducts();
  }, [initialProducts.length]);

  function scrollToCheckout() {
    document.getElementById("shop-checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openProductDetail(product: Product) {
    setDetailProductId(product.id);
  }

  function addToCart(product: Product, qty = 1) {
    const sameItem = cartTouched && selectedProductId === product.id;
    setSelectedProductId(product.id);
    setQuantity(sameItem ? Math.min(CART_QTY_MAX, quantity + qty) : qty);
    setDetailProductId(null);
    setCartTouched(true);
    setCartOpen(true);
  }

  function handleAddToCart(product: Product) {
    addToCart(product, 1);
  }

  async function onCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isStaticSite) {
      return;
    }
    if (!cartTouched || !selectedProductId) {
      setMessage(t.shopCheckoutEmptyCart);
      return;
    }

    const email = customerEmail.trim();
    const phone = digitsOnly(customerPhone);

    if (!email && !phone) {
      setMessage(t.shopContactRequired);
      return;
    }
    if (phone && !isValidPhoneDigits(phone)) {
      setMessage(t.shopContactPhoneInvalid);
      return;
    }
    if (email && !isValidEmail(email)) {
      setMessage(t.shopContactEmailInvalid);
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setLocalPaymentData(null);
    setProofUploaded(false);

    const idempotencyKey = checkoutIdempotencyKeyRef.current || nextIdempotencyKey();
    try {
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          locale,
          paymentMethod: checkoutPaymentMethod,
          customerName,
          customerEmail: email,
          customerPhone: phone,
          items: [{ productId: selectedProductId, quantity }],
        }),
      });

      const data = (await parseJsonResponse(response)) as Record<string, unknown>;

      const isLocalPayOk =
        response.ok &&
        typeof data.orderId === "string" &&
        typeof data.paymentAccount === "string" &&
        (typeof data.uploadToken === "string" || data.proofViaWhatsapp === true);

      if (isLocalPayOk) {
        setLocalPaymentData({
          orderId: String(data.orderId),
          paymentMethod: (typeof data.paymentMethod === "string"
            ? data.paymentMethod
            : checkoutPaymentMethod) as PaymentMethod,
          amountCents: Number(data.amountCents) || 0,
          currency: typeof data.currency === "string" ? data.currency : "mop",
          paymentAccount: String(data.paymentAccount),
          paymentNote: typeof data.paymentNote === "string" ? data.paymentNote : "",
          message: typeof data.message === "string" ? data.message : "",
          uploadToken: typeof data.uploadToken === "string" ? data.uploadToken : "",
          proofViaWhatsapp: data.proofViaWhatsapp === true || !data.uploadToken,
        });
        setMessage(typeof data.message === "string" ? data.message : "");
        nextIdempotencyKey();
        return;
      }

      if (typeof data.checkoutUrl === "string" && data.checkoutUrl) {
        nextIdempotencyKey();
        window.location.href = data.checkoutUrl;
        return;
      }

      setMessage(
        typeof data.message === "string" ? data.message : "Checkout is unavailable. Please try again.",
      );
    } catch {
      setMessage("Network error — checkout did not complete. Please try again or contact the salon.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onUploadProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localPaymentData || !proofFile) {
      setMessage("Please select screenshot file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("orderId", localPaymentData.orderId);
    formData.append("uploadToken", localPaymentData.uploadToken);
    formData.append("proof", proofFile);

    const response = await fetch("/api/shop/orders/upload-proof", {
      method: "POST",
      body: formData,
    });

    const data = (await parseJsonResponse(response)) as { message?: string; proofViewUrl?: string };
    if (response.ok) {
      setProofUploaded(true);
      setMessage(t.shopProofReceived);
      nextIdempotencyKey();
    } else {
      setMessage(data.message ?? "Upload failed.");
    }
    setIsUploading(false);
  }

  const subtotalCents = selectedProduct ? selectedProduct.priceCents * quantity : 0;
  const selectedPayAccount = localPaymentAccount(checkoutPaymentMethod);
  const selectedPayQrSrc = paymentMethodQrSrc(checkoutPaymentMethod);
  const hasCartItem = Boolean(cartTouched && selectedProduct);

  function resetLocalPayment() {
    setLocalPaymentData(null);
    setProofUploaded(false);
    setProofFile(null);
    setMessage("");
  }

  async function openStaticWeChatOrder() {
    if (!orderHelpWeChatId || !selectedProduct) {
      return;
    }
    const totalLine = priceDisplay(subtotalCents, selectedProduct.currency);
    const text = buildStaticOrderLines(
      locale,
      selectedProduct,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      totalLine,
      checkoutPaymentMethod,
    );
    const copied = await copyTextToClipboard(text);
    const sheetKey = [
      customerName.trim(),
      digitsOnly(customerPhone),
      selectedProduct.id,
      String(quantity),
      checkoutPaymentMethod,
    ].join("|");
    if (sheetKey !== lastStaticSheetKeyRef.current) {
      lastStaticSheetKeyRef.current = sheetKey;
      queueSpreadsheetSync({
        orderId: fallbackSheetOrderId("ORD"),
        customerName: customerName.trim(),
        phone: digitsOnly(customerPhone),
        service: `${selectedProduct.nameZh} × ${quantity}`,
        notes: customerEmail.trim(),
        amount: subtotalCents / 100,
        paidAmount: 0,
        paymentMethod: paymentMethodLabel(checkoutPaymentMethod, "zh-HK"),
        paymentStatus: "待付款",
        remark: "網店訂單（靜態頁）",
      });
    }
    setMessage(
      copied ? t.shopWechatOrderCopied.replace("{wechat}", orderHelpWeChatId) : text,
    );
  }

  function proceedFromCart() {
    setCartOpen(false);
    if (isStaticSite) {
      scrollToCheckout();
      if (orderHelpWeChatId && selectedProduct) {
        void openStaticWeChatOrder();
      }
      return;
    }
    scrollToCheckout();
  }

  const staticMailtoHref =
    orderHelpEmail && selectedProduct && hasCartItem
      ? `mailto:${orderHelpEmail}?subject=${encodeURIComponent(locale === "zh-HK" ? "藝能網店訂購" : "n_nsalon order")}&body=${encodeURIComponent(
          buildStaticOrderLines(
            locale,
            selectedProduct,
            quantity,
            customerName,
            customerEmail,
            customerPhone,
            priceDisplay(subtotalCents, selectedProduct.currency),
            checkoutPaymentMethod,
          ),
        )}`
      : null;
  const inputClass =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700";
  const labelClass = "flex flex-col gap-1.5 text-sm text-neutral-700";

  const selectArrowStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23737373' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const,
    backgroundPosition: "right 0.75rem center",
  };

  return (
    <div className="mt-6 space-y-0">
      {totalCatalog === 0 ? (
        <div className="mt-10 space-y-3 py-12 text-center">
          <p className="text-sm text-neutral-600">{message || t.shopNoProducts}</p>
          <p className="text-sm text-neutral-500">{t.shopEmptyCta}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:hidden">
            <details className="rounded-lg border border-neutral-200 bg-white px-3 transition-shadow duration-200 ease-out open:shadow-sm">
              <summary className="cursor-pointer py-3 text-sm font-medium text-neutral-800 transition-colors duration-200 hover:text-neutral-950">
                {locale === "zh-HK" ? "篩選" : "Filters"}
              </summary>
              <div className="pb-3">
                <FilterSidebar
                  t={t}
                  categoryOptions={categoryOptions}
                  filterCats={filterCats}
                  toggleFilter={toggleFilter}
                  clearFilters={clearFilters}
                />
              </div>
            </details>
          </div>

          <aside className="hidden w-72 shrink-0 lg:block" aria-label="Filters">
            <FilterSidebar
              t={t}
              categoryOptions={categoryOptions}
              filterCats={filterCats}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4">
              <label htmlFor="shop-product-search" className="sr-only">
                {t.shopSearchLabel}
              </label>
              <input
                ref={searchInputRef}
                id="shop-product-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.shopSearchPlaceholder}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-neutral-400 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                autoComplete="off"
              />
            </div>
            <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-pressed={viewMode === "grid-3"}
                  aria-label={t.shopViewGridLarge}
                  onClick={() => setViewMode("grid-3")}
                  className={`rounded-md p-2 text-neutral-600 transition-all duration-200 ease-out hover:bg-neutral-100 active:scale-95 motion-reduce:active:scale-100 ${
                    viewMode === "grid-3" ? "bg-neutral-200 text-zinc-900" : ""
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "grid-2"}
                  aria-label={t.shopViewGridSmall}
                  onClick={() => setViewMode("grid-2")}
                  className={`rounded-md p-2 text-neutral-600 transition-all duration-200 ease-out hover:bg-neutral-100 active:scale-95 motion-reduce:active:scale-100 ${
                    viewMode === "grid-2" ? "bg-neutral-200 text-zinc-900" : ""
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M4 4h8v10H4V4zm10 0h6v5h-6V4zM4 15h8v5H4v-5zm10 0h6v5h-6v-5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === "list"}
                  aria-label={t.shopViewList}
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-2 text-neutral-600 transition-all duration-200 ease-out hover:bg-neutral-100 active:scale-95 motion-reduce:active:scale-100 ${
                    viewMode === "list" ? "bg-neutral-200 text-zinc-900" : ""
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-sm text-neutral-700 sm:flex-1">
                {t.shopProductCount.replace("{n}", String(n))}
              </p>

              <div className="flex w-full flex-col gap-1 sm:w-auto sm:min-w-[200px]">
                <label htmlFor="shop-sort" className="text-xs text-neutral-500">
                  {t.shopSortByLabel}
                </label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="w-full cursor-pointer appearance-none rounded-md border border-neutral-300 bg-white py-2 pl-3 pr-8 text-sm text-neutral-800 transition-[border-color,box-shadow] duration-200 ease-out focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  style={selectArrowStyle}
                >
                  <option value="default">{t.shopSortDefault}</option>
                  <option value="price-asc">{t.shopSortPriceAsc}</option>
                  <option value="price-desc">{t.shopSortPriceDesc}</option>
                </select>
              </div>
            </div>

            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              {t.shopShowing
                .replace("{from}", n ? "1" : "0")
                .replace("{to}", String(n))
                .replace("{total}", String(totalCatalog))}
            </p>

            {n === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-8 text-center">
                <p className="text-sm text-neutral-600">{t.shopNoFilterMatch}</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm font-medium text-zinc-900 underline underline-offset-2"
                >
                  {t.shopClearFilters}
                </button>
              </div>
            ) : (
              <ul
                className={
                  viewMode === "list"
                    ? "flex list-none flex-col gap-4"
                    : viewMode === "grid-2"
                      ? "grid list-none grid-cols-1 gap-6 sm:grid-cols-2"
                      : "grid list-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {filteredProducts.map((product) => (
                  <li key={product.id}>
                    <ShopProductCard
                      product={product}
                      layout={viewMode === "list" ? "list" : "grid"}
                      isSelected={product.id === selectedProductId}
                      onViewDetail={() => openProductDetail(product)}
                      onAdd={() => handleAddToCart(product)}
                      t={t}
                      locale={locale}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div id="shop-checkout" className="scroll-mt-24 border-t border-neutral-200/90 bg-neutral-50/90 px-0 py-10 sm:py-12">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {localPaymentData ? t.shopLocalPayFlowTitle : t.shopCheckoutTitle}
        </h3>

        {localPaymentData ? (
          <div
            id="shop-local-payment"
            className="mt-6 scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 shadow-sm"
          >
            <p className="text-base font-medium text-neutral-900">{t.shopPayNextSteps}</p>
            <p className="mt-4 font-medium text-neutral-900">
              {t.shopOrderIdLabel}：{localPaymentData.orderId}
            </p>
            <p>
              {t.shopAmountLabel}：
              {priceDisplay(localPaymentData.amountCents, localPaymentData.currency)}
            </p>
            <p>
              {paymentAccountLabel(localPaymentData.paymentMethod, t)}：{localPaymentData.paymentAccount}
            </p>
            <p className="mt-2 text-neutral-600">{paymentMethodNote(localPaymentData.paymentMethod, locale)}</p>
            {paymentMethodQrSrc(localPaymentData.paymentMethod) ? (
              <PaymentCollectionQr
                src={paymentMethodQrSrc(localPaymentData.paymentMethod)!}
                alt={t.shopPaymentQrAlt}
                caption={t.shopPaymentQrCaption}
              />
            ) : null}

            {proofUploaded ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
                {t.shopProofReviewPending}
              </p>
            ) : localPaymentData.proofViaWhatsapp ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {orderHelpWeChatId ? (
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const proofText =
                          locale === "zh-HK"
                            ? `【付款截圖】訂單 ${localPaymentData.orderId}\n金額 ${(localPaymentData.amountCents / 100).toFixed(2)} ${localPaymentData.currency.toUpperCase()}\n方式 ${paymentMethodLabel(localPaymentData.paymentMethod, locale)}\n（請附上付款截圖）`
                            : `[Payment proof] Order ${localPaymentData.orderId}\nAmount ${(localPaymentData.amountCents / 100).toFixed(2)} ${localPaymentData.currency.toUpperCase()}\nVia ${paymentMethodLabel(localPaymentData.paymentMethod, locale)}\n(Please attach payment screenshot)`;
                        const copied = await copyTextToClipboard(proofText);
                        setMessage(
                          copied && orderHelpWeChatId
                            ? t.shopWechatOrderCopied.replace("{wechat}", orderHelpWeChatId)
                            : proofText,
                        );
                      })();
                    }}
                    className="inline-flex w-fit rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-zinc-800"
                  >
                    {t.shopWechatOrder}
                  </button>
                ) : null}
                {orderHelpEmail ? (
                  <a
                    href={`mailto:${orderHelpEmail}?subject=${encodeURIComponent(`Payment proof ${localPaymentData.orderId}`)}&body=${encodeURIComponent(
                      `Order ID: ${localPaymentData.orderId}\nAmount: ${(localPaymentData.amountCents / 100).toFixed(2)} ${localPaymentData.currency.toUpperCase()}\n`,
                    )}`}
                    className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-400 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 ease-out hover:bg-zinc-50"
                  >
                    {t.shopMailOrder}
                  </a>
                ) : null}
              </div>
            ) : (
              <form className="mt-4 flex flex-col gap-3" onSubmit={onUploadProof}>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
                  <p className="text-sm font-semibold text-neutral-900">{t.shopProofUploadLabel}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{t.shopProofUploadHint}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
                      {proofFile ? t.shopProofChangeFile : t.shopProofChooseFile}
                      <input
                        className="sr-only"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                      />
                    </label>
                    <p className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                      {proofFile ? proofFile.name : t.shopProofNoFile}
                    </p>
                  </div>

                  {proofPreviewUrl ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                      <img
                        src={proofPreviewUrl}
                        alt={t.shopProofPreviewLabel}
                        className="max-h-64 w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>

                <button
                  className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 motion-reduce:active:scale-100 sm:w-fit"
                  type="submit"
                  disabled={isUploading || !proofFile}
                >
                  {isUploading ? t.shopProofUploading : t.shopProofSubmit}
                </button>
              </form>
            )}

            {message ? <p className="mt-4 text-sm text-neutral-600">{message}</p> : null}

            <button
              type="button"
              onClick={resetLocalPayment}
              className="mt-4 text-sm font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
            >
              {t.shopPlaceAnotherOrder}
            </button>
          </div>
        ) : (
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onCheckout}>
            <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 shadow-sm">
              <p className="font-medium text-neutral-900">{t.shopOrderSummaryLabel}</p>
              {hasCartItem && selectedProduct ? (
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                  <p>
                    {locale === "zh-HK" ? selectedProduct.nameZh : selectedProduct.nameEn} × {quantity} →{" "}
                    {priceDisplay(subtotalCents, selectedProduct.currency)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                  >
                    {t.shopChangeQty}
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-neutral-500">{t.shopCheckoutEmptyCart}</p>
              )}
            </div>

            {isStaticSite ? (
              <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
                {t.shopStaticCheckoutNote}
              </div>
            ) : null}

            <fieldset className="md:col-span-2">
              <legend className="text-sm text-neutral-700">{t.shopPaymentLabel}</legend>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t.shopPaymentLabel}>
                {visibleShopPaymentMethods().map((method) => {
                  const selected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-neutral-300 bg-white text-neutral-800 hover:border-zinc-500"
                      }`}
                    >
                      {paymentMethodLabel(method, locale)}
                    </button>
                  );
                })}
              </div>
              {isStaticSite ? (
                <div className="mt-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
                  <p>{paymentMethodNote(checkoutPaymentMethod, locale)}</p>
                  {selectedPayAccount ? (
                    <p className="mt-2 font-medium text-neutral-900">
                      {paymentAccountLabel(checkoutPaymentMethod, t)}：{selectedPayAccount}
                    </p>
                  ) : null}
                  {selectedPayQrSrc ? (
                    <PaymentCollectionQr
                      src={selectedPayQrSrc}
                      alt={t.shopPaymentQrAlt}
                      caption={t.shopPaymentQrCaption}
                    />
                  ) : null}
                </div>
              ) : checkoutPaymentMethod !== "stripe_card" ? (
                <p className="mt-3 text-sm text-neutral-500">{t.shopPaymentHintAfterOrder}</p>
              ) : null}
            </fieldset>

            <label className={labelClass}>
              <span>{t.shopCustomerNameLabel}</span>
              <input
                className={inputClass}
                required={!isStaticSite}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                minLength={isStaticSite ? undefined : 2}
                autoComplete="name"
              />
            </label>

            <label className={labelClass}>
              <span>{t.shopContactPhoneOption}</span>
              <input
                className={inputClass}
                type="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder={locale === "zh-HK" ? "例如 62345678" : "e.g. 62345678"}
                autoComplete="tel"
              />
              <span className="text-xs text-neutral-500">{t.shopContactPhoneHint}</span>
            </label>

            <label className={`${labelClass} md:col-span-2`}>
              <span>{t.shopContactEmailOptional}</span>
              <input
                className={inputClass}
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />
              <span className="text-xs text-neutral-500">{t.shopContactEmailHint}</span>
            </label>

            {isStaticSite ? (
              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:flex-wrap">
                {orderHelpWeChatId ? (
                  <button
                    type="button"
                    className="inline-flex w-fit rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 motion-reduce:active:scale-100"
                    disabled={!hasCartItem}
                    onClick={() => void openStaticWeChatOrder()}
                  >
                    {t.shopWechatOrder}
                  </button>
                ) : null}
                {staticMailtoHref ? (
                  <a
                    href={staticMailtoHref}
                    className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-400 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 ease-out hover:bg-zinc-50"
                  >
                    {t.shopMailOrder}
                  </a>
                ) : null}
                {!orderHelpWeChatId && !orderHelpEmail ? (
                  <p className="text-sm text-neutral-600">
                    {locale === "zh-HK"
                      ? "請在網站設定 WeChat 或電郵以便落單。"
                      : "Set NEXT_PUBLIC_WECHAT_ID or salon email for order links."}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="md:col-span-2">
                <button
                  className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60 motion-reduce:active:scale-100 sm:w-fit"
                  type="submit"
                  disabled={isSubmitting || !hasCartItem}
                >
                  {isSubmitting
                    ? locale === "zh-HK"
                      ? "處理中…"
                      : "Processing..."
                    : checkoutPaymentMethod === "stripe_card"
                      ? t.shopPayCardCta
                      : t.shopPayLocalCta}
                </button>
              </div>
            )}
            {message ? <p className="text-sm text-neutral-600 md:col-span-2">{message}</p> : null}
          </form>
        )}
      </div>

      {detailProduct ? (
        <ShopProductDetailPanel
          product={detailProduct}
          locale={locale}
          category={inferCategoryKey(detailProduct)}
          t={t}
          onClose={() => setDetailProductId(null)}
          onAddToCart={(qty) => addToCart(detailProduct, qty)}
          priceLabel={priceDisplay(detailProduct.priceCents, detailProduct.currency)}
          categoryLabel={categoryLabel(t, inferCategoryKey(detailProduct))}
        />
      ) : null}

      <ShopCartDrawer
        open={cartOpen}
        product={selectedProduct}
        quantity={quantity}
        locale={locale}
        subtotalLabel={
          selectedProduct ? priceDisplay(subtotalCents, selectedProduct.currency) : "—"
        }
        t={t}
        isStaticSite={isStaticSite}
        onClose={() => setCartOpen(false)}
        onCheckout={proceedFromCart}
        onQuantityChange={setQuantity}
      />

      {selectedProduct && cartTouched && !cartOpen && !detailProductId && !localPaymentData ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-neutral-600">
                {locale === "zh-HK" ? selectedProduct.nameZh : selectedProduct.nameEn}
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                {priceDisplay(subtotalCents, selectedProduct.currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="shrink-0 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              {t.shopStickyViewCart}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
