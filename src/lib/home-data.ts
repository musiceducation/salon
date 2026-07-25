import { staticShopCatalogForExport } from "@/data/shop-catalog-static";
import type { Locale } from "@/lib/i18n";
import { listOpenBookingSlots, type BookingSlotOption } from "@/lib/booking-slots";
import { prisma } from "@/lib/prisma";
import type { HomeProduct } from "@/lib/shop-product";

export type { HomeProduct } from "@/lib/shop-product";

export type HomeSlot = BookingSlotOption;

export async function getHomeProducts(): Promise<HomeProduct[]> {
  if (process.env.STATIC_EXPORT === "1") {
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
  if (process.env.STATIC_EXPORT === "1") {
    return [];
  }
  try {
    return await listOpenBookingSlots(locale, serviceKey);
  } catch {
    return [];
  }
}
