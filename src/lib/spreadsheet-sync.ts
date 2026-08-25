/**
 * Append a booking / shop-order row to the salon Google Sheet via Apps Script.
 * Failures are logged only — they must never block the customer-facing flow.
 */

export type SpreadsheetOrderPayload = {
  orderId?: string;
  bookingDate?: string;
  customerName?: string;
  phone?: string;
  isMember?: boolean;
  service?: string;
  notes?: string;
  amount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  stylist?: string;
  remark?: string;
};

export type SpreadsheetOrderRow = {
  orderId: string;
  bookingDate: string;
  customerName: string;
  phone: string;
  isMember: boolean;
  service: string;
  notes: string;
  amount: number;
  paidAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  stylist: string;
  remark: string;
};

/** Fallback prices (MOP) when DB service rows are not available — matches prisma/seed.ts. */
export const BOOKING_SERVICE_SHEET: Record<string, { nameZh: string; amount: number }> = {
  haircut: { nameZh: "洗剪造型", amount: 280 },
  color: { nameZh: "染髮", amount: 780 },
  perm: { nameZh: "燙髮", amount: 980 },
};

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwWhRHKou2SYI3OlrOvWYcf_oZIwI9UOxKaKdxbI82C6mn4KUQOsr_gDab5_N6ws-efUA/exec";

export function getSpreadsheetAppsScriptUrl(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL?.trim() ||
    process.env.GOOGLE_APPS_SCRIPT_URL?.trim() ||
    DEFAULT_APPS_SCRIPT_URL
  );
}

export function formatMacauDateTime(value: Date | string | number | null | undefined): string {
  if (value == null || value === "") {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Macau",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function fallbackSheetOrderId(prefix = "ORD"): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function buildSpreadsheetRow(orderData: SpreadsheetOrderPayload): SpreadsheetOrderRow {
  return {
    orderId: orderData.orderId || fallbackSheetOrderId(),
    bookingDate: orderData.bookingDate || "",
    customerName: orderData.customerName || "",
    phone: orderData.phone || "",
    isMember: Boolean(orderData.isMember),
    service: orderData.service || "",
    notes: orderData.notes || "",
    amount: Number(orderData.amount) || 0,
    paidAmount: Number(orderData.paidAmount) || 0,
    paymentMethod: orderData.paymentMethod || "現金",
    paymentStatus: orderData.paymentStatus || "待付款",
    stylist: orderData.stylist || "店長",
    remark: orderData.remark || "",
  };
}

/**
 * POST JSON to the Apps Script web app.
 * text/plain avoids a CORS preflight; GAS still reads postData.contents.
 */
export async function submitOrderToSpreadsheet(orderData: SpreadsheetOrderPayload): Promise<void> {
  const url = getSpreadsheetAppsScriptUrl();
  if (!url) {
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(buildSpreadsheetRow(orderData)),
    });
  } catch (error) {
    console.error("[spreadsheet-sync]", error);
  }
}

/** Fire-and-forget so a ledger outage never fails booking or checkout. */
export function queueSpreadsheetSync(orderData: SpreadsheetOrderPayload): void {
  void submitOrderToSpreadsheet(orderData);
}
