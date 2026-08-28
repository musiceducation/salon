import { staticShopCatalogForExport } from "@/data/shop-catalog-static";
import type { Locale } from "@/lib/i18n";
import { listOpenBookingSlots, type BookingSlotOption } from "@/lib/booking-slots";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import type { HomeProduct } from "@/lib/shop-product";

export type { HomeProduct } from "@/lib/shop-product";

export type HomeSlot = BookingSlotOption;

function useStaticCatalog() {
  return process.env.STATIC_EXPORT === "1" || !hasDatabaseUrl();
}

export async function getHomeProducts(): Promise<HomeProduct[]> {
  if (useStaticCatalog()) {
    return staticShopCatalogForExport;
  }
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nameZh: true,
        nameEn: true,
        priceCents: true,
        currency: true,
        imageUrl: true,
      },
    });
  } catch {
    return staticShopCatalogForExport;
  }
}

export async function getHomeSlotsForService(
  locale: Locale,
  serviceKey: string,
): Promise<HomeSlot[]> {
  if (useStaticCatalog()) {
    return [];
  }
  try {
    return await listOpenBookingSlots(locale, serviceKey);
  } catch {
    return [];
  }
}
