import { staticShopCatalogForExport } from "@/data/shop-catalog-static";
import type { HomeProduct } from "@/lib/shop-product";

/**
 * Resolve cart lines when Prisma is down or demo/static IDs are used
 * (local checkout without Postgres).
 */
const DEMO_TO_STATIC_ID: Record<string, string> = {
  "demo-perfect-spray": "static-perfect-spray-voc55-380ml",
  "demo-puny-shampoo": "static-vivaltone-puny-balancing-shampoo-750ml",
  "demo-vivltone-clay": "static-vivltone-super-clay-100ml",
  "demo-ahcmax-growth": "static-ahcmax-hair-growth-spray-60ml",
  "demo-kerasilk-oil": "static-kerasilk-multi-benefit-hair-oil-50ml",
  "demo-kerasilk-balm": "static-kerasilk-taming-balm-75ml",
  "demo-vivltone": "static-vivltone-super-spray-380ml",
};

export function catalogProductById(productId: string): HomeProduct | undefined {
  const resolved = DEMO_TO_STATIC_ID[productId] ?? productId;
  return staticShopCatalogForExport.find((p) => p.id === resolved);
}

export function resolveCheckoutProductsFromCatalog(
  items: { productId: string; quantity: number }[],
): { product: HomeProduct; quantity: number }[] {
  return items
    .map((item) => {
      const product = catalogProductById(item.productId);
      if (!product || item.quantity <= 0) {
        return null;
      }
      return { product, quantity: item.quantity };
    })
    .filter((entry): entry is { product: HomeProduct; quantity: number } => entry !== null);
}
