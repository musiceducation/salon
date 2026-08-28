import { NextResponse } from "next/server";
import { staticShopCatalogForExport } from "@/data/shop-catalog-static";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

const catalogHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ products: staticShopCatalogForExport }, { headers: catalogHeaders });
  }

  try {
    const products = await prisma.product.findMany({
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
    return NextResponse.json({ products }, { headers: catalogHeaders });
  } catch (error) {
    console.error("[shop/products]", error);
    return NextResponse.json({ products: staticShopCatalogForExport }, { headers: catalogHeaders });
  }
}
