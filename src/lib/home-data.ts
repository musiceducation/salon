import { staticShopCatalogForExport } from "@/data/shop-catalog-static";
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { HomeProduct } from "@/lib/shop-product";

export type { HomeProduct } from "@/lib/shop-product";

function slotLocaleTag(locale: Locale): string {
  return locale === "zh-HK" ? "zh-HK" : "en-HK";
}

export type HomeSlot = {
  id: string;
  label: string;
};

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
  try {
    const rows = await prisma.availabilitySlot.findMany({
      where: {
        serviceKey,
        status: "open",
        remaining: { gt: 0 },
      },
      orderBy: { startsAt: "asc" },
      take: 12,
    });
    const tag = slotLocaleTag(locale);
    return rows.map((slot) => ({
      id: slot.id,
      label: slot.startsAt.toLocaleString(tag, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));
  } catch {
    return [];
  }
}
