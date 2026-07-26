import { NextResponse } from "next/server";
import { staticShopCatalogForExport } from "@/data/shop-catalog-static";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const isProd = process.env.NODE_ENV === "production";

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
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch (error) {
    console.error("[shop/products]", error);
    if (isProd) {
      return NextResponse.json(
        { message: "Product catalog is temporarily unavailable." },
        { status: 503 },
      );
    }
    return NextResponse.json({ products: staticShopCatalogForExport }, { status: 200 });
  }
}
