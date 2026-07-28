import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/email";
import { requireAdminRequest } from "@/lib/verify-admin-request";
import { isOrderTransitionAllowed } from "@/lib/order-transitions";
import type { OrderStatus } from "@prisma/client";

type PatchPayload = {
  orderId?: string;
  status?: OrderStatus;
  note?: string;
};

function formatReceiptNumber(year: number, sequence: number) {
  return `NN-${year}-${String(sequence).padStart(6, "0")}`;
}

export async function GET(request: Request) {
  const denied = await requireAdminRequest(request);
  if (denied) {
    return denied;
  }

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            select: { nameZh: true, nameEn: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const denied = await requireAdminRequest(request);
  if (denied) {
    return denied;
  }

  const body = (await request.json()) as PatchPayload;

  if (!body.orderId || !body.status) {
    return NextResponse.json({ message: "Missing orderId or status." }, { status: 400 });
  }

  const nextStatus = body.status;
  const orderId = body.orderId;
  let notFound = false;

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: orderId },
        select: { id: true, receiptNumber: true, status: true },
      });

      if (!current) {
        notFound = true;
        return null;
      }

      if (!isOrderTransitionAllowed(current.status, nextStatus)) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      let newReceiptNumber: string | undefined;
      const shouldGenerateReceipt = nextStatus === "paid" && !current.receiptNumber;
      if (shouldGenerateReceipt) {
        const year = new Date().getFullYear();
        const counter = await tx.receiptCounter.upsert({
          where: { year },
          update: { nextNumber: { increment: 1 } },
          create: { year, nextNumber: 2 },
          select: { nextNumber: true },
        });

        const issuedSequence = counter.nextNumber - 1;
        newReceiptNumber = formatReceiptNumber(year, issuedSequence);
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          ...(shouldGenerateReceipt && newReceiptNumber ? { receiptNumber: newReceiptNumber } : {}),
          ...(body.note !== undefined ? { lastStatusNote: body.note } : {}),
          paidAt: nextStatus === "paid" ? new Date() : undefined,
        },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          totalAmountCents: true,
          currency: true,
          status: true,
          receiptNumber: true,
          lastStatusNote: true,
          updatedAt: true,
        },
      });
    });

    if (notFound || !updatedOrder) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    let emailMessage = "Email not sent.";
    const customerEmail = updatedOrder.customerEmail?.trim() ?? "";
    if (
      customerEmail &&
      ["paid", "failed", "cancelled", "proof_submitted"].includes(updatedOrder.status)
    ) {
      const emailResult = await sendOrderStatusEmail({
        to: customerEmail,
        customerName: updatedOrder.customerName,
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        amountCents: updatedOrder.totalAmountCents,
        currency: updatedOrder.currency,
        receiptNumber: updatedOrder.receiptNumber,
      });

      if (emailResult.sent) {
        emailMessage = "Customer email sent.";
      } else if (emailResult.reason === "smtp_not_configured") {
        emailMessage = "Status updated. SMTP is not configured, email skipped.";
      }
    } else if (!customerEmail) {
      emailMessage = updatedOrder.customerPhone
        ? "No email on order (phone contact only); email skipped."
        : "No customer email; email skipped.";
    }

    return NextResponse.json({
      order: updatedOrder,
      message: `Order status updated. ${emailMessage}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_STATUS_TRANSITION") {
      return NextResponse.json({ message: "Invalid status transition for this order." }, { status: 400 });
    }
    throw error;
  }
}
