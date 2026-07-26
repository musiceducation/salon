import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export type BookingSlotOption = {
  id: string;
  label: string;
};

function slotLocaleTag(locale: string): string {
  return locale === "zh-HK" ? "zh-HK" : "en-HK";
}

/** Open, bookable slots for a service — future starts only. Never invents fake IDs. */
export async function listOpenBookingSlots(
  locale: Locale | string,
  serviceKey: string,
  take = 12,
): Promise<BookingSlotOption[]> {
  const rows = await prisma.availabilitySlot.findMany({
    where: {
      serviceKey,
      status: "open",
      remaining: { gt: 0 },
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    take,
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
}
