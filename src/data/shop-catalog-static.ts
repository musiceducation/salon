import type { HomeProduct } from "../lib/shop-product";

export type ShopCatalogSku = {
  slug: string;
  nameZh: string;
  nameEn: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  currency: "mop";
  /** 1 = first on the shop (newest `createdAt`). Inactive SKUs are omitted from the static catalog. */
  listOrder: number;
  isActive: boolean;
  /** Legacy localStorage / demo cart IDs. */
  demoId?: string;
};

export function staticCatalogId(slug: string): string {
  return `static-${slug}`;
}

/**
 * Single source of truth for shop SKUs.
 * Seed upserts these rows; STATIC_EXPORT / no-DB fallbacks derive the storefront list from active SKUs.
 */
export const shopCatalogSkus: ShopCatalogSku[] = [
  {
    slug: "vivaltone-puny-balancing-shampoo-750ml",
    nameZh: "PUNY 平衡洗髮露（細軟油頭）750ml",
    nameEn: "PUNY Balancing Shampoo 750ml",
    description: "For fine / limp oily hair · pH 4.5–5.5 · 750ml · For professional use only.",
    imageUrl: "/shop/vivaltone-puny-balancing-shampoo-750ml.png",
    priceCents: 18000,
    currency: "mop",
    listOrder: 1,
    isActive: true,
    demoId: "demo-puny-shampoo",
  },
  {
    slug: "vialtone-aquae-moisturizing-shampoo-750ml",
    nameZh: "AQUAE 沃特絲保濕洗髮露（中性/乾髮）750ml",
    nameEn: "AQUAE Moisturizing Shampoo 750ml",
    description: "For normal to dry hair · pH 4.5–5.5 · 750ml · For professional use only.",
    imageUrl: "/shop/vialtone-aquae-moisturizing-shampoo-750ml.png",
    priceCents: 18000,
    currency: "mop",
    listOrder: 2,
    isActive: true,
    demoId: "demo-aquae-shampoo",
  },
  {
    slug: "vialtone-stop-anti-hair-loss-shampoo-500ml",
    nameZh: "VIALTONE 防掉髮洗髮露 500ml",
    nameEn: "VIALTONE STOP Anti-Hair Loss Shampoo 500ml",
    description: "Anti-hair loss · for normal and weak hair · pH 4.5–5.5 · 500ml · For professional use only.",
    imageUrl: "/shop/vialtone-stop-anti-hair-loss-shampoo-500ml.png",
    priceCents: 18000,
    currency: "mop",
    listOrder: 3,
    isActive: true,
    demoId: "demo-stop-shampoo",
  },
  {
    slug: "fg-gewei-keratin-shampoo",
    nameZh: "FGgewei 角蛋白洗髮水 1L",
    nameEn: "FG GeWei Keratin Shampoo 1L",
    description: "Repair dry damaged hair · silk protein · sulfate free · 1L.",
    imageUrl: "/shop/fg-gewei-keratin-shampoo-1l.png",
    priceCents: 23000,
    currency: "mop",
    listOrder: 4,
    isActive: true,
    demoId: "demo-fg-keratin",
  },
  {
    slug: "fg-gewei-collagen-keratin-shampoo-500ml",
    nameZh: "FGgewei 膠原角蛋白洗髮露 500ml",
    nameEn: "FG GeWei Collagen Keratin Shampoo 500ml",
    description: "Repairs dry, damaged or stressed hair · sulfate free · 500ml / 16.9 FL.OZ.",
    imageUrl: "/shop/fg-gewei-collagen-keratin-shampoo-500ml.png",
    priceCents: 20000,
    currency: "mop",
    listOrder: 5,
    isActive: true,
    demoId: "demo-fg-collagen-shampoo",
  },
  {
    slug: "fg-gewei-collagen-keratin-conditioner-500ml",
    nameZh: "FGgewei 膠原角蛋白護髮素 500ml",
    nameEn: "FG GeWei Collagen Keratin Conditioner 500ml",
    description: "Dye / iron care · enhances shine and silky feel · 500ml / 16.9 FL.OZ.",
    imageUrl: "/shop/fg-gewei-collagen-keratin-conditioner-500ml.png",
    priceCents: 20000,
    currency: "mop",
    listOrder: 6,
    isActive: true,
    demoId: "demo-fg-collagen-conditioner",
  },
  {
    slug: "vivltone-super-spray-380ml",
    nameZh: "VIALTONE 定型噴霧 380ml",
    nameEn: "VIALTONE Super Spray 380ml",
    description: "Professional finishing spray · VOC 55 · 380ml / Net 300g · Environment-friendly formula.",
    imageUrl: "/shop/vivltone-super-spray-380ml.png",
    priceCents: 15000,
    currency: "mop",
    listOrder: 7,
    isActive: true,
    demoId: "demo-vivltone",
  },
  {
    slug: "vialtone-perfect-seaspy-170ml",
    nameZh: "VIALTONE 造型噴霧水 170ml",
    nameEn: "VIALTONE Perfect SeaSpy 170ml",
    description: "Styling mist · Perfect SeaSpy · 170ml.",
    imageUrl: "/shop/vialtone-perfect-seaspy-170ml.png",
    priceCents: 15000,
    currency: "mop",
    listOrder: 8,
    isActive: true,
    demoId: "demo-seaspy",
  },
  {
    slug: "back-gel-120ml",
    nameZh: "BACK GEL 造型啫喱 120ml",
    nameEn: "BACK GEL 120ml",
    description: "Perfect Gel · styling gel · 120ml.",
    imageUrl: "/shop/back-gel-120ml.png",
    priceCents: 12000,
    currency: "mop",
    listOrder: 9,
    isActive: true,
    demoId: "demo-back-gel",
  },
  {
    slug: "vivltone-super-clay-100ml",
    nameZh: "VIALTONE SUPER CLAY 髮泥 100ml",
    nameEn: "VIALTONE Super Clay 100ml",
    description: "Firm hold texturising matte paste · all hair types · 100ml.",
    imageUrl: "/shop/vivltone-super-clay-100ml.png",
    priceCents: 12000,
    currency: "mop",
    listOrder: 10,
    isActive: true,
    demoId: "demo-vivltone-clay",
  },
  {
    slug: "villytone-kx360-hair-treatment-lotion-500ml",
    nameZh: "VILLYTONE 強韌重組水 500ml",
    nameEn: "VILLYTONE Hair Treatment Lotion 500ml",
    description: "強韌重組水 · Keraplex 360+ · pH4 · 強化韌度、降鹼去異味 · 500ml / 17.6 OZ.",
    imageUrl: "/shop/villytone-kx360-hair-treatment-lotion-500ml.png",
    priceCents: 48000,
    currency: "mop",
    listOrder: 11,
    isActive: true,
    demoId: "demo-keraplex-lotion",
  },
  {
    slug: "vivltone-keraplex-360-hair-treatment-mask-500ml",
    nameZh: "VILLYTONE KX 360 結構重組護理 500ml",
    nameEn: "VILLYTONE KX 360 Hair Treatment Mask 500ml",
    description: "結構重組護理 · Keraplex 360+ · pH4 · 八種氨基酸 + 水解角蛋白 · 500ml / 17.6 OZ.",
    imageUrl: "/shop/vivltone-keraplex-360-hair-treatment-mask-500ml.png",
    priceCents: 50000,
    currency: "mop",
    listOrder: 12,
    isActive: true,
    demoId: "demo-keraplex-mask",
  },
  {
    slug: "perfect-spray-voc55-380ml",
    nameZh: "Perfect Spray 造型噴霧 380ml",
    nameEn: "Perfect Spray 380ml",
    description: "VOC 55 · environment-friendly formula · 380ml professional finishing spray.",
    imageUrl: "/shop/perfect-spray-380ml.png",
    priceCents: 18000,
    currency: "mop",
    listOrder: 13,
    isActive: true,
    demoId: "demo-perfect-spray",
  },
  {
    slug: "ahcmax-hair-growth-spray-60ml",
    nameZh: "ahcMax 育髮噴霧 60ml",
    nameEn: "ahcMax Hair Growth Spray 60ml",
    description:
      "Intensive energizing for thinning hair · botanical extracts · 60ml / 2.03 FL.OZ. · Formulated in Japan.",
    imageUrl: "/shop/ahcmax-hair-growth-spray-60ml.png",
    priceCents: 29800,
    currency: "mop",
    listOrder: 14,
    isActive: true,
    demoId: "demo-ahcmax-growth",
  },
  {
    slug: "kerasilk-multi-benefit-hair-oil-50ml",
    nameZh: "Kerasilk 多功能護髮油 50ml",
    nameEn: "Kerasilk Multi-Benefit Hair Oil 50ml",
    description: "Polished, protected finish · lightweight multi-benefit hair oil · 50ml / 1.6 FL.OZ.",
    imageUrl: "/shop/kerasilk-multi-benefit-hair-oil-50ml.png",
    priceCents: 26800,
    currency: "mop",
    listOrder: 15,
    isActive: true,
    demoId: "demo-kerasilk-oil",
  },
  {
    slug: "kerasilk-taming-balm-75ml",
    nameZh: "Kerasilk 順服乳霜 75ml",
    nameEn: "Kerasilk Taming Balm 75ml",
    description: "Smooth, soft finish · taming balm · 75ml / 2.5 FL.OZ.",
    imageUrl: "/shop/kerasilk-taming-balm-75ml.png",
    priceCents: 26800,
    currency: "mop",
    listOrder: 16,
    isActive: true,
    demoId: "demo-kerasilk-balm",
  },
  {
    slug: "repair-treatment-mask",
    nameZh: "深層修護髮膜",
    nameEn: "Repair Treatment Mask",
    description: "Weekly deep-repair treatment for damaged hair.",
    imageUrl: "",
    priceCents: 32800,
    currency: "mop",
    listOrder: 99,
    isActive: false,
  },
];

function toHomeProduct(sku: ShopCatalogSku): HomeProduct {
  return {
    id: staticCatalogId(sku.slug),
    nameZh: sku.nameZh,
    nameEn: sku.nameEn,
    priceCents: sku.priceCents,
    currency: sku.currency,
    imageUrl: sku.imageUrl || null,
  };
}

/**
 * Catalog baked into HTML for `STATIC_EXPORT` (GitHub Pages): no DB, no `/api/shop/*`.
 * Order matches seed `createdAt desc` (listOrder ascending).
 */
export const staticShopCatalogForExport: HomeProduct[] = shopCatalogSkus
  .filter((sku) => sku.isActive)
  .slice()
  .sort((a, b) => a.listOrder - b.listOrder)
  .map(toHomeProduct);

export const demoToStaticCatalogId: Record<string, string> = Object.fromEntries(
  shopCatalogSkus
    .filter((sku): sku is ShopCatalogSku & { demoId: string } => Boolean(sku.demoId))
    .map((sku) => [sku.demoId, staticCatalogId(sku.slug)]),
);
