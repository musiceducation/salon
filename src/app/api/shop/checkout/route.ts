import { randomBytes } from "node:crypto";
import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { withIdempotencyByKey } from "@/lib/idempotency";
import { resolveCheckoutProductsFromCatalog } from "@/lib/shop-catalog";
import {
  isCardCheckoutEnabled,
  isLocalShopPaymentMethod,
  localPaymentInstructions,
  paymentMethodLabel,
  resolveCheckoutPaymentMethod,
  type ShopPaymentMethod,
} from "@/lib/shop-payment-methods";
import { submitOrderToSpreadsheet } from "@/lib/spreadsheet-sync";

const TEE_SIZES = ["S", "M", "L", "XL", "2XL"] as const;

type CheckoutItem = {
  productId: string;
  quantity: number;
  size?: string;
};

type CheckoutPayload = {
  locale?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
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
    slug?: string;
  };
  quantity: number;
  size: string | null;
};

function normalizeTeeSize(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const size = value.trim().toUpperCase();
  return (TEE_SIZES as readonly string[]).includes(size) ? size : null;
}

function lineIsTonsoTee(product: { id: string; nameZh: string; nameEn: string; slug?: string }) {
  if (product.slug === "tonso-memorial-tee" || product.id.includes("tonso-memorial-tee")) {
    return true;
  }
  const blob = `${product.nameZh} ${product.nameEn}`.toLowerCase();
  return blob.includes("tonso") && /\btee\b/.test(blob);
}

function serviceLabel(line: ResolvedLine) {
  return `${line.product.nameZh}${line.size ? ` · ${line.size}` : ""} × ${line.quantity}`;
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneDigits(phone: string) {
  const d = digitsOnly(phone);
  return d.length >= 6 && d.length <= 15;
}

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
          return { product, quantity: item.quantity, size: normalizeTeeSize(item.size) };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    }
  } catch {
    /* fall through to static catalog */
  }
  return resolveCheckoutProductsFromCatalog(items).map((line) => ({
    ...line,
    size: normalizeTeeSize(items.find((item) => item.productId === line.product.id)?.size),
  }));
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
        const zh = body.locale === "zh-HK";

        if (paymentMethod === "stripe_card" && !isCardCheckoutEnabled()) {
          return {
            status: 400,
            body: {
              message: zh
                ? "暫時只接受 MPay 或中銀轉帳（人工核對）。"
                : "Only MPay or BOC bank transfer is available right now (manual review).",
            },
          };
        }

        const customerName = body.customerName?.trim() ?? "";
        const customerEmail = body.customerEmail?.trim() ?? "";
        const customerPhone = body.customerPhone ? digitsOnly(body.customerPhone) : "";

        if (!customerName || !body.items || body.items.length === 0) {
          return { status: 400, body: { message: "Missing checkout fields." } };
        }

        const hasEmail = customerEmail.length > 0;
        const hasPhone = customerPhone.length > 0;

        if (!hasEmail && !hasPhone) {
          return {
            status: 400,
            body: {
              message: zh
                ? "請填寫電郵或電話其中一項。"
                : "Please enter either an email or a phone number.",
            },
          };
        }

        if (hasEmail && !isValidEmail(customerEmail)) {
          return {
            status: 400,
            body: {
              message: zh ? "請輸入有效電郵地址。" : "Please enter a valid email address.",
            },
          };
        }

        if (hasPhone && !isValidPhoneDigits(customerPhone)) {
          return {
            status: 400,
            body: {
              message: zh
                ? "請輸入有效電話號碼（6–15 位數字）。"
                : "Please enter a valid phone number (6–15 digits).",
            },
          };
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
        const orderCurrency = orderCurrencies[0] ?? "mop";

        const lines = mappedItems.map((line) => ({
          ...line,
          size: lineIsTonsoTee(line.product) ? line.size : null,
        }));
        if (lines.some((line) => lineIsTonsoTee(line.product) && !line.size)) {
          return {
            status: 400,
            body: {
              message: zh ? "請選擇尺碼（S–2XL）。" : "Please choose a size (S–2XL).",
            },
          };
        }
        const sizeNote = lines
          .filter((line) => line.size)
          .map((line) => `尺碼 ${line.size}`)
          .join("、");

        const orderContact = {
          customerName,
          customerEmail: hasEmail ? customerEmail : "",
          customerPhone: hasPhone ? customerPhone : null,
        };

        function syncShopOrderToSpreadsheet(orderId: string, method: ShopPaymentMethod) {
          after(() => {
            void submitOrderToSpreadsheet({
              orderId,
              customerName,
              phone: hasPhone ? customerPhone : "",
              service: lines.map((item) => serviceLabel(item)).join("、"),
              notes: hasEmail ? customerEmail : "",
              amount: totalAmountCents / 100,
              paidAmount: 0,
              paymentMethod: paymentMethodLabel(method, "zh-HK"),
              paymentStatus: "待付款",
              remark: "網店訂單",
            });
          });
        }

        if (isLocalShopPaymentMethod(paymentMethod)) {
          const locale = zh ? "zh-HK" : "en";
          const instructions = localPaymentInstructions(paymentMethod, locale);

          try {
            const uploadToken = randomBytes(32).toString("hex");
            const order = await prisma.order.create({
              data: {
                ...orderContact,
                totalAmountCents,
                currency: orderCurrency,
                status: "pending",
                paymentMethod,
                paymentUploadToken: uploadToken,
                paymentAccount: instructions.account,
                paymentNote: instructions.note,
                ...(sizeNote ? { lastStatusNote: sizeNote } : {}),
                items: {
                  create: lines.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPriceCents: item.product.priceCents,
                  })),
                },
              },
            });

            syncShopOrderToSpreadsheet(order.id, paymentMethod);

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
            syncShopOrderToSpreadsheet(orderId, paymentMethod);
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
              ...orderContact,
              totalAmountCents,
              currency: orderCurrency,
              status: "pending",
              paymentMethod: "stripe_card",
              paymentNote: "Paid through Stripe card checkout.",
              ...(sizeNote ? { lastStatusNote: sizeNote } : {}),
              items: {
                create: lines.map((item) => ({
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
              message: zh
                ? "暫時無法使用刷卡，請改選 MPay 等本地付款。"
                : "Card checkout unavailable. Please choose MPay or another local method.",
            },
          };
        }

        try {
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            ...(hasEmail ? { customer_email: customerEmail } : {}),
            line_items: lines.map((item) => ({
              quantity: item.quantity,
              price_data: {
                currency: item.product.currency,
                unit_amount: item.product.priceCents,
                product_data: {
                  name: `${body.locale === "zh-HK" ? item.product.nameZh : item.product.nameEn}${item.size ? ` · ${item.size}` : ""}`,
                },
              },
            })),
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.locale ?? "zh-HK"}?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.locale ?? "zh-HK"}?checkout=cancelled`,
            metadata: {
              orderId: order.id,
              ...(hasPhone ? { customerPhone } : {}),
            },
          });

          if (!session.url) {
            throw new Error("Missing Stripe session URL");
          }

          await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: session.id },
          });

          syncShopOrderToSpreadsheet(order.id, "stripe_card");

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
