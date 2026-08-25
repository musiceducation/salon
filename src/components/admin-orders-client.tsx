"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format-money";

export type AdminOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  status: "pending" | "proof_submitted" | "paid" | "failed" | "cancelled";
  paymentMethod: string;
  paymentProofUrl: string | null;
  receiptNumber?: string | null;
  lastStatusNote?: string | null;
  totalAmountCents: number;
  currency: string;
};

function formatCustomerContact(order: AdminOrder) {
  const parts = [order.customerEmail?.trim(), order.customerPhone?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

type AdminOrdersClientProps = {
  initialOrders: AdminOrder[];
};

const statusOptions: AdminOrder["status"][] = [
  "pending",
  "proof_submitted",
  "paid",
  "failed",
  "cancelled",
];

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");

  async function updateStatus(orderId: string, status: AdminOrder["status"]) {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    const data = (await response.json()) as {
      order?: {
        status: AdminOrder["status"];
        receiptNumber?: string | null;
        lastStatusNote?: string | null;
      };
      message?: string;
    };
    if (!response.ok) {
      setMessage(data.message ?? "Failed to update order status.");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              receiptNumber: data.order?.receiptNumber ?? order.receiptNumber,
              lastStatusNote: data.order?.lastStatusNote ?? order.lastStatusNote,
            }
          : order,
      ),
    );
    setMessage(data.message ?? `Updated order ${orderId} to ${status}.`);
  }

  return (
    <>
      {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <section key={order.id} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-sm">
            <p>Order: {order.id}</p>
            <p>
              Customer: {order.customerName} ({formatCustomerContact(order)})
            </p>
            <p>
              Amount: {formatMoney(order.totalAmountCents, order.currency)}
            </p>
            <p>Payment: {order.paymentMethod}</p>
            <p>Status: {order.status}</p>
            {order.receiptNumber ? <p>E-receipt: {order.receiptNumber}</p> : null}
            {order.lastStatusNote ? <p>Note: {order.lastStatusNote}</p> : null}
            {order.paymentProofUrl ? (
              <a
                className="mt-2 inline-block font-medium text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                href={order.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
              >
                View payment screenshot →
              </a>
            ) : (
              <p className="mt-2 text-zinc-400">No proof uploaded yet.</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="rounded-full border border-zinc-500 px-3 py-1 hover:border-zinc-200"
                  onClick={() => updateStatus(order.id, status)}
                >
                  Mark {status}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
