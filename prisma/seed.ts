import { PrismaClient, SlotStatus } from "@prisma/client";
import { shopCatalogSkus } from "../src/data/shop-catalog-static";

const prisma = new PrismaClient();

/** Mon,Tue,Thu–Sun 11:00–20:00 · Wed closed (Asia/Macau). */
const OPEN_MIN = 11 * 60;
const CLOSE_MIN = 20 * 60;
const SLOT_STEP_MINS = 30;
const DAYS_AHEAD = 14;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Interpret wall-clock time in Macau as an absolute `Date` (Macau has no DST). */
function macauWallTime(y: number, mo: number, d: number, h: number, mi: number): Date {
  return new Date(`${y}-${pad2(mo)}-${pad2(d)}T${pad2(h)}:${pad2(mi)}:00+08:00`);
}

function partsMacauYmd(from: Date): { y: number; mo: number; d: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Macau",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, mo, d] = fmt.format(from).split("-").map((x) => parseInt(x, 10));
  return { y, mo, d };
}

function addCalendarDays(y: number, mo: number, d: number, delta: number): { y: number; mo: number; d: number } {
  const base = macauWallTime(y, mo, d, 12, 0);
  const next = new Date(base.getTime() + delta * 86400000);
  return partsMacauYmd(next);
}

function macauWeekday(y: number, mo: number, d: number): number {
  const dt = macauWallTime(y, mo, d, 12, 0);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Macau", weekday: "short" }).format(dt);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

/**
 * Idempotent for dev: removes future slots that have no appointments, then inserts
 * 30-minute start intervals per active service (ends by 20:00 Macau).
 */
async function seedAvailabilitySlots() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { key: true, durationMins: true },
  });
  if (services.length === 0) {
    return;
  }

  const now = new Date();

  await prisma.availabilitySlot.deleteMany({
    where: {
      startsAt: { gte: now },
      appointments: { none: {} },
    },
  });

  const today = partsMacauYmd(now);
  const rows: {
    serviceKey: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    remaining: number;
    status: SlotStatus;
  }[] = [];

  for (let dayIdx = 0; dayIdx < DAYS_AHEAD; dayIdx++) {
    const { y, mo, d } = addCalendarDays(today.y, today.mo, today.d, dayIdx);
    if (macauWeekday(y, mo, d) === 3) {
      continue;
    }

    for (const svc of services) {
      const dur = svc.durationMins;
      for (let t = OPEN_MIN; t + dur <= CLOSE_MIN; t += SLOT_STEP_MINS) {
        const h = Math.floor(t / 60);
        const mi = t % 60;
        const startsAt = macauWallTime(y, mo, d, h, mi);
        const endsAt = new Date(startsAt.getTime() + dur * 60 * 1000);
        if (startsAt.getTime() < now.getTime()) {
          continue;
        }
        rows.push({
          serviceKey: svc.key,
          startsAt,
          endsAt,
          capacity: 1,
          remaining: 1,
          status: SlotStatus.open,
        });
      }
    }
  }

  if (rows.length > 0) {
    await prisma.availabilitySlot.createMany({ data: rows });
  }

  console.log(
    `Seeded ${rows.length} availability slots (Macau 11:00–20:00, Wed closed, ${SLOT_STEP_MINS}m starts, ${DAYS_AHEAD} days).`,
  );
}

async function main() {
  await prisma.service.upsert({
    where: { key: "haircut" },
    update: {},
    create: {
      key: "haircut",
      nameZh: "洗剪造型",
      nameEn: "Haircut",
      durationMins: 60,
      basePrice: 280,
    },
  });

  await prisma.service.upsert({
    where: { key: "color" },
    update: {},
    create: {
      key: "color",
      nameZh: "染髮",
      nameEn: "Color",
      durationMins: 120,
      basePrice: 780,
    },
  });

  await prisma.service.upsert({
    where: { key: "perm" },
    update: {},
    create: {
      key: "perm",
      nameZh: "燙髮",
      nameEn: "Perm",
      durationMins: 150,
      basePrice: 980,
    },
  });

  const listedAtAnchor = Date.now();
  const listedAt = (n: number) => new Date(listedAtAnchor - (n - 1) * 1000);

  for (const sku of shopCatalogSkus) {
    const payload = {
      nameZh: sku.nameZh,
      nameEn: sku.nameEn,
      description: sku.description,
      imageUrl: sku.imageUrl || null,
      priceCents: sku.priceCents,
      currency: sku.currency,
      isActive: sku.isActive,
      createdAt: listedAt(sku.listOrder),
    };
    await prisma.product.upsert({
      where: { slug: sku.slug },
      update: payload,
      create: { slug: sku.slug, ...payload },
    });
  }

  await prisma.product.updateMany({
    where: { slug: "moisture-shampoo-500ml" },
    data: { isActive: false },
  });

  await prisma.product.updateMany({ data: { currency: "mop" } });

  await seedAvailabilitySlots();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
