/**
 * tonso · lamp memorial tee — the only apparel SKU.
 * Prices and sizes come from the seller; the member amount is a note, not a charge.
 */

export const TONSO_TEE_SLUG = "tonso-memorial-tee";

/** Printed and shared codes stay on this URL, including from preview deploys. */
export const TONSO_TEE_CANONICAL_URL = "https://www.nnsalon.com/products/tonso-memorial-tee";

export const TONSO_TEE_QR_PATH = "/shop/tonso-memorial-tee-qr.svg";

/** Live Postgres id, when the storefront list comes from the database rather than `static-{slug}`. */
export const TONSO_TEE_LIVE_PRODUCT_ID = "cmvkurf0v0000jsubrei9jqis";

export const TONSO_TEE_SIZES = ["S", "M", "L", "XL", "2XL"] as const;

export type TonsoTeeSize = (typeof TONSO_TEE_SIZES)[number];

/** In-store member note only. Checkout still charges the catalog price. */
export const TONSO_TEE_MEMBER_PRICE_CENTS = 26800;

export const TONSO_TEE_SIZE_HEADERS = [
  "尺碼",
  "身高(cm)",
  "體重(斤)",
  "胸圍(cm)",
  "肩寬(cm)",
  "袖長(cm)",
  "衣長(cm)",
] as const;

export const TONSO_TEE_SIZE_NOTE =
  "溫馨提示：因手工測量方式不同，存在 1–3 cm 左右誤差屬正常現象。";

export const TONSO_TEE_PHOTOS = [
  { src: "/shop/tonso-memorial-tee.png", labelZh: "上身正面", labelEn: "Worn front" },
  { src: "/shop/tonso-memorial-tee-worn-back.png", labelZh: "上身背面", labelEn: "Worn back" },
  { src: "/shop/tonso-memorial-tee-flat-front.png", labelZh: "平鋪正面", labelEn: "Flat front" },
  { src: "/shop/tonso-memorial-tee-flat-back.png", labelZh: "平鋪背面", labelEn: "Flat back" },
] as const;

export const TONSO_TEE_SIZE_CHART: {
  size: TonsoTeeSize;
  height: string;
  weight: string;
  chest: string;
  shoulder: string;
  sleeve: string;
  length: string;
}[] = [
  { size: "S", height: "155-165", weight: "90-100", chest: "108", shoulder: "54", sleeve: "22", length: "69" },
  { size: "M", height: "165-170", weight: "100-120", chest: "112", shoulder: "55.5", sleeve: "23", length: "71" },
  { size: "L", height: "170-175", weight: "120-150", chest: "116", shoulder: "57", sleeve: "24", length: "73" },
  { size: "XL", height: "175-180", weight: "150-170", chest: "120", shoulder: "58.5", sleeve: "25", length: "75" },
  { size: "2XL", height: "180-190", weight: "170-200", chest: "124", shoulder: "60", sleeve: "26", length: "77" },
];

export function normalizeTonsoTeeSize(value: unknown): TonsoTeeSize | null {
  if (typeof value !== "string") {
    return null;
  }
  const size = value.trim().toUpperCase();
  return (TONSO_TEE_SIZES as readonly string[]).includes(size) ? (size as TonsoTeeSize) : null;
}

export function isTonsoMemorialTee(product: {
  id: string;
  nameZh?: string | null;
  nameEn?: string | null;
  slug?: string | null;
}): boolean {
  if (
    product.slug === TONSO_TEE_SLUG ||
    product.id === TONSO_TEE_LIVE_PRODUCT_ID ||
    product.id.includes(TONSO_TEE_SLUG)
  ) {
    return true;
  }
  const blob = `${product.nameZh ?? ""} ${product.nameEn ?? ""}`.toLowerCase();
  return blob.includes("tonso") && (/\btee\b/.test(blob) || (product.nameZh ?? "").includes("短袖"));
}
