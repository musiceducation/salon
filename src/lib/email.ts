import nodemailer from "nodemailer";

type OrderStatus = "pending" | "proof_submitted" | "paid" | "failed" | "cancelled";

type SendOrderStatusEmailInput = {
  to: string;
  customerName: string;
  orderId: string;
  status: OrderStatus;
  amountCents: number;
  currency: string;
  receiptNumber?: string | null;
  /** Order note, including apparel size when the salon recorded one. */
  note?: string | null;
};

function getStatusText(status: OrderStatus) {
  switch (status) {
    case "paid":
      return {
        zh: "已確認收款",
        en: "Payment Confirmed",
      };
    case "failed":
      return {
        zh: "付款未成功",
        en: "Payment Failed",
      };
    case "cancelled":
      return {
        zh: "訂單已取消",
        en: "Order Cancelled",
      };
    case "proof_submitted":
      return {
        zh: "已收到付款憑證，審核中",
        en: "Proof Received, Under Review",
      };
    default:
      return {
        zh: "訂單狀態更新",
        en: "Order Status Updated",
      };
  }
}

export async function sendOrderStatusEmail(input: SendOrderStatusEmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    return { sent: false, reason: "smtp_not_configured" as const };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const statusText = getStatusText(input.status);
  const amount = `${(input.amountCents / 100).toFixed(2)} ${input.currency.toUpperCase()}`;
  const subject = `[n_nsalon] ${statusText.en} / ${statusText.zh} - ${input.orderId}`;
  const note = input.note?.trim() ?? "";

  const text = [
    `Hello ${input.customerName},`,
    `Your order ${input.orderId} status is now: ${statusText.en}.`,
    `Amount: ${amount}`,
    input.receiptNumber ? `E-receipt: ${input.receiptNumber}` : "",
    note ? `Note: ${note}` : "",
    "",
    `您好，${input.customerName}：`,
    `你的訂單 ${input.orderId} 狀態更新為：${statusText.zh}。`,
    `金額：${amount}`,
    input.receiptNumber ? `電子收據編號：${input.receiptNumber}` : "",
    note ? `備註：${note}` : "",
  ].join("\n");

  await transporter.sendMail({
    from,
    to: input.to,
    subject,
    text,
  });

  return { sent: true, reason: "ok" as const };
}
