import { NextResponse } from "next/server";
import { listOpenBookingSlots } from "@/lib/booking-slots";

const ALLOWED_SERVICES = new Set(["haircut", "color", "perm"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") ?? "haircut";
  const locale = searchParams.get("locale") ?? "en";

  if (!ALLOWED_SERVICES.has(service)) {
    return NextResponse.json({ slots: [] });
  }

  try {
    const slots = await listOpenBookingSlots(locale, service);
    return NextResponse.json(
      { slots },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (error) {
    console.error("[booking/slots]", error);
    // Never invent slot IDs — booking POST requires real AvailabilitySlot rows.
    return NextResponse.json(
      { slots: [], message: "Availability is temporarily unavailable." },
      { status: 503 },
    );
  }
}
