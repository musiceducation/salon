import { AdminOrdersClient } from "@/components/admin-orders-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      status: true,
      paymentMethod: true,
      paymentProofUrl: true,
      receiptNumber: true,
      lastStatusNote: true,
      totalAmountCents: true,
      currency: true,
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <h1 className="text-2xl font-semibold">Order Review Console</h1>
      <p className="mt-2 text-zinc-400">Manual review for MPay / 中銀 payment proof.</p>
      <p className="mt-1 text-sm text-zinc-500">
        E-receipt format: NN-YYYY-000001. Sequence resets every year on Jan 1.
      </p>
      <AdminOrdersClient initialOrders={orders} />
    </main>
  );
}
