import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withIdempotencyByKey } from "@/lib/idempotency";
import { resolveCheckoutProductsFromCatalog } from "@/lib/shop-catalog";
import {
  defaultCheckoutPaymentMethod,
  isCardCheckoutEnabled,
  isLocalShopPaymentMethod,
  localPaymentInstructions,
  resolveCheckoutPaymentMethod,
  type ShopPaymentMethod,
} from "@/lib/shop-payment-methods";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutPayload = {
  locale?: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: ShopPaymentMethod;
  items?: CheckoutItem[];
};

type ResolvedLine = {
  product: {
    id: string;
    nameZh: string;
    nameEn: string;
    priceCents: number;
    currency: string;
  };
  quantity: number;
};

async function resolveMappedItems(items: CheckoutItem[]): Promise<ResolvedLine[]> {
  const productIds = items.map((item) => item.productId);
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    if (products.length > 0) {
      return items
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          if (!product || item.quantity <= 0) {
            return null;
          }
          return { product, quantity: item.quantity };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    }
  } catch {
    /* fall through to static catalog */
  }
  return resolveCheckoutProductsFromCatalog(items);
}

export async function POST(request: Request) {
  try {
    const idempotencyKey = request.headers.get("idempotency-key");
    const body = (await request.json()) as CheckoutPayload;
    const result = await withIdempotencyByKey<Record<string, unknown>>(
      idempotencyKey,
      "shop_checkout",
      async () => {
        const paymentMethod = resolveCheckoutPaymentMethod(body.paymentMethod);

        if (paymentMethod === "stripe_card" && !isCardCheckoutEnabled()) {
          return {
            status: 400,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "暫時只接受 MPay 或中銀轉帳（人工核對）。"
                  : "Only MPay or BOC bank transfer is available right now (manual review).",
            },
          };
        }

        if (!body.customerName || !body.customerEmail || !body.items || body.items.length === 0) {
          return { status: 400, body: { message: "Missing checkout fields." } };
        }

        const mappedItems = await resolveMappedItems(body.items);
        if (mappedItems.length === 0) {
          return { status: 400, body: { message: "No valid products found." } };
        }

        const totalAmountCents = mappedItems.reduce(
          (sum, item) => sum + item.product.priceCents * item.quantity,
          0,
        );

        const orderCurrencies = [
          ...new Set(mappedItems.map((item) => item.product.currency.toLowerCase())),
        ];
        if (orderCurrencies.length > 1) {
          return {
            status: 400,
            body: { message: "Mixed currencies in one order are not supported." },
          };
        }
        const orderCurrency = orderCurrencies[0] ?? "hkd";

        if (isLocalShopPaymentMethod(paymentMethod)) {
          const locale = body.locale === "zh-HK" ? "zh-HK" : "en";
          const instructions = localPaymentInstructions(paymentMethod, locale);
          const zh = locale === "zh-HK";

          try {
            const uploadToken = randomBytes(32).toString("hex");
            const order = await prisma.order.create({
              data: {
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                totalAmountCents,
                currency: orderCurrency,
                status: "pending",
                paymentMethod,
                paymentUploadToken: uploadToken,
                paymentAccount: instructions.account,
                paymentNote: instructions.note,
                items: {
                  create: mappedItems.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPriceCents: item.product.priceCents,
                  })),
                },
              },
            });

            return {
              status: 201,
              body: {
                orderId: order.id,
                paymentMethod,
                amountCents: order.totalAmountCents,
                currency: order.currency,
                paymentAccount: instructions.account,
                paymentNote: instructions.note,
                uploadToken,
                proofViaWhatsapp: false,
                message: zh
                  ? "訂單已建立，請按以下資料付款並上傳付款截圖。"
                  : "Order created. Please pay using the details below and upload payment proof.",
              },
            };
          } catch {
            /* No DB / catalog-only IDs — still return pay-to details for manual flow */
            const orderId = `manual-${Date.now().toString(36)}`;
            return {
              status: 201,
              body: {
                orderId,
                paymentMethod,
                amountCents: totalAmountCents,
                currency: orderCurrency,
                paymentAccount: instructions.account,
                paymentNote: instructions.note,
                uploadToken: "",
                proofViaWhatsapp: true,
                message: zh
                  ? "請掃碼或轉帳付款，完成後以 WeChat／電郵傳送截圖（訂單編號見下）。"
                  : "Please pay via QR or transfer, then send your screenshot on WeChat/email (order ID below).",
              },
            };
          }
        }

        if (!stripe || !process.env.NEXT_PUBLIC_SITE_URL) {
          return {
            status: 500,
            body: {
              message: "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_SITE_URL.",
            },
          };
        }

        let order: { id: string };
        try {
          order = await prisma.order.create({
            data: {
              customerName: body.customerName,
              customerEmail: body.customerEmail,
              totalAmountCents,
              currency: orderCurrency,
              status: "pending",
              paymentMethod: "stripe_card",
              paymentNote: "Paid through Stripe card checkout.",
              items: {
                create: mappedItems.map((item) => ({
                  productId: item.product.id,
                  quantity: item.quantity,
                  unitPriceCents: item.product.priceCents,
                })),
              },
            },
          });
        } catch {
          return {
            status: 503,
            body: {
              message:
                body.locale === "zh-HK"
                  ? "暫時無法使用刷卡，請改選 MPay 等本地付款。"
                  : "Card checkout unavailable. Please choose MPay or another local method.",
            },
          };
        }

        try {
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: body.customerEmail,
            line_items: mappedItems.map((item) => ({
              quantity: item.quantity,
              price_data: {
                currency: item.product.currency,
                unit_amount: item.product.priceCents,
                product_data: {
                  name: body.locale === "zh-HK" ? item.product.nameZh : item.product.nameEn,
                },
              },
            })),
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.locale ?? "zh-HK"}?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.locale ?? "zh-HK"}?checkout=cancelled`,
            metadata: {
              orderId: order.id,
            },
          });

          if (!session.url) {
            throw new Error("Missing Stripe session URL");
          }

          await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: session.id },
          });

          return {
            status: 201,
            body: { checkoutUrl: session.url, orderId: order.id },
          };
        } catch {
          await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
          return {
            status: 500,
            body: {
              message: "Could not start card checkout. Please try again or choose local payment.",
            },
          };
        }
      },
    );

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("[shop/checkout]", error);
    return NextResponse.json(
      { message: "Checkout is unavailable. Please try again." },
      { status: 503 },
    );
  }
}
