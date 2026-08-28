import type { HomeProduct } from "@/lib/shop-product";

/**
 * Catalog baked into HTML for `STATIC_EXPORT` (GitHub Pages): no DB, no `/api/shop/*`.
 * Keep in sync with active rows in `prisma/seed.ts` (order: newest first, matching `createdAt desc`; omit inactive SKUs).
 */
export const staticShopCatalogForExport: HomeProduct[] = [
  {
    id: "static-villytone-kx360-hair-treatment-lotion-500ml",
    nameZh: "VILLYTONE 強韌重組水 500ml",
    nameEn: "VILLYTONE Hair Treatment Lotion 500ml",
    priceCents: 48000,
    currency: "mop",
    imageUrl: "/shop/villytone-kx360-hair-treatment-lotion-500ml.png",
  },
  {
    id: "static-vivltone-keraplex-360-hair-treatment-mask-500ml",
    nameZh: "VILLYTONE KX 360 結構重組護理 500ml",
    nameEn: "VILLYTONE KX 360 Hair Treatment Mask 500ml",
    priceCents: 50000,
    currency: "mop",
    imageUrl: "/shop/vivltone-keraplex-360-hair-treatment-mask-500ml.png",
  },
  {
    id: "static-perfect-spray-voc55-380ml",
    nameZh: "Perfect Spray 造型噴霧 380ml",
    nameEn: "Perfect Spray 380ml",
    priceCents: 18000,
    currency: "mop",
    imageUrl: "/shop/perfect-spray-380ml.png",
  },
  {
    id: "static-vivaltone-puny-balancing-shampoo-750ml",
    nameZh: "VIVALTONE PUNY 平衡洗髮露 750ml",
    nameEn: "VIVALTONE PUNY Balancing Shampoo 750ml",
    priceCents: 36800,
    currency: "mop",
    imageUrl: "/shop/vivaltone-puny-balancing-shampoo-750ml.png",
  },
  {
    id: "static-vivltone-super-clay-100ml",
    nameZh: "VIVLTONE Super Clay 造型髮泥 100ml",
    nameEn: "VIVLTONE Super Clay 100ml",
    priceCents: 22800,
    currency: "mop",
    imageUrl: "/shop/vivltone-super-clay-100ml.png",
  },
  {
    id: "static-ahcmax-hair-growth-spray-60ml",
    nameZh: "ahcMax 育髮噴霧 60ml",
    nameEn: "ahcMax Hair Growth Spray 60ml",
    priceCents: 29800,
    currency: "mop",
    imageUrl: "/shop/ahcmax-hair-growth-spray-60ml.png",
  },
  {
    id: "static-kerasilk-multi-benefit-hair-oil-50ml",
    nameZh: "Kerasilk 多功能護髮油 50ml",
    nameEn: "Kerasilk Multi-Benefit Hair Oil 50ml",
    priceCents: 26800,
    currency: "mop",
    imageUrl: "/shop/kerasilk-multi-benefit-hair-oil-50ml.png",
  },
  {
    id: "static-kerasilk-taming-balm-75ml",
    nameZh: "Kerasilk 順服乳霜 75ml",
    nameEn: "Kerasilk Taming Balm 75ml",
    priceCents: 26800,
    currency: "mop",
    imageUrl: "/shop/kerasilk-taming-balm-75ml.png",
  },
  {
    id: "static-vivltone-super-spray-380ml",
    nameZh: "VIVLTONE Super Spray 380ml",
    nameEn: "VIVLTONE Super Spray 380ml",
    priceCents: 18000,
    currency: "mop",
    imageUrl: "/shop/vivltone-super-spray-380ml.png",
  },
];
