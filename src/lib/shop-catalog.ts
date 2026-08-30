import { demoToStaticCatalogId, staticShopCatalogForExport } from "@/data/shop-catalog-static";
import type { HomeProduct } from "@/lib/shop-product";

/**
 * Resolve cart lines when Prisma is down or demo/static IDs are used
 * (local checkout without Postgres).
 */
export function catalogProductById(productId: string): HomeProduct | undefined {
  const resolved = demoToStaticCatalogId[productId] ?? productId;
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
