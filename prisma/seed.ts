import { PrismaClient, SlotStatus } from "@prisma/client";

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

  await prisma.product.updateMany({
    where: { slug: "moisture-shampoo-500ml" },
    data: { isActive: false },
  });

  await prisma.product.upsert({
    where: { slug: "repair-treatment-mask" },
    update: { isActive: false },
    create: {
      slug: "repair-treatment-mask",
      nameZh: "深層修護髮膜",
      nameEn: "Repair Treatment Mask",
      description: "Weekly deep-repair treatment for damaged hair.",
      priceCents: 32800,
      currency: "mop",
      isActive: false,
    },
  });

  await prisma.product.upsert({
    where: { slug: "vivltone-super-spray-380ml" },
    update: {
      nameZh: "VIVLTONE Super Spray 380ml",
      nameEn: "VIVLTONE Super Spray 380ml",
      description: "Professional finishing spray · VOC 55 · 380ml / Net 300g · Environment-friendly formula.",
      imageUrl: "/shop/vivltone-super-spray-380ml.png",
      priceCents: 18000,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "vivltone-super-spray-380ml",
      nameZh: "VIVLTONE Super Spray 380ml",
      nameEn: "VIVLTONE Super Spray 380ml",
      description: "Professional finishing spray · VOC 55 · 380ml / Net 300g · Environment-friendly formula.",
      imageUrl: "/shop/vivltone-super-spray-380ml.png",
      priceCents: 18000,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "kerasilk-taming-balm-75ml" },
    update: {
      nameZh: "Kerasilk 順服乳霜 75ml",
      nameEn: "Kerasilk Taming Balm 75ml",
      description: "Smooth, soft finish · taming balm · 75ml / 2.5 FL.OZ.",
      imageUrl: "/shop/kerasilk-taming-balm-75ml.png",
      priceCents: 26800,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "kerasilk-taming-balm-75ml",
      nameZh: "Kerasilk 順服乳霜 75ml",
      nameEn: "Kerasilk Taming Balm 75ml",
      description: "Smooth, soft finish · taming balm · 75ml / 2.5 FL.OZ.",
      imageUrl: "/shop/kerasilk-taming-balm-75ml.png",
      priceCents: 26800,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "kerasilk-multi-benefit-hair-oil-50ml" },
    update: {
      nameZh: "Kerasilk 多功能護髮油 50ml",
      nameEn: "Kerasilk Multi-Benefit Hair Oil 50ml",
      description:
        "Polished, protected finish · lightweight multi-benefit hair oil · 50ml / 1.6 FL.OZ.",
      imageUrl: "/shop/kerasilk-multi-benefit-hair-oil-50ml.png",
      priceCents: 26800,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "kerasilk-multi-benefit-hair-oil-50ml",
      nameZh: "Kerasilk 多功能護髮油 50ml",
      nameEn: "Kerasilk Multi-Benefit Hair Oil 50ml",
      description:
        "Polished, protected finish · lightweight multi-benefit hair oil · 50ml / 1.6 FL.OZ.",
      imageUrl: "/shop/kerasilk-multi-benefit-hair-oil-50ml.png",
      priceCents: 26800,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "ahcmax-hair-growth-spray-60ml" },
    update: {
      nameZh: "ahcMax 育髮噴霧 60ml",
      nameEn: "ahcMax Hair Growth Spray 60ml",
      description:
        "Intensive energizing for thinning hair · botanical extracts · 60ml / 2.03 FL.OZ. · Formulated in Japan.",
      imageUrl: "/shop/ahcmax-hair-growth-spray-60ml.png",
      priceCents: 29800,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "ahcmax-hair-growth-spray-60ml",
      nameZh: "ahcMax 育髮噴霧 60ml",
      nameEn: "ahcMax Hair Growth Spray 60ml",
      description:
        "Intensive energizing for thinning hair · botanical extracts · 60ml / 2.03 FL.OZ. · Formulated in Japan.",
      imageUrl: "/shop/ahcmax-hair-growth-spray-60ml.png",
      priceCents: 29800,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "vivltone-super-clay-100ml" },
    update: {
      nameZh: "VIVLTONE Super Clay 造型髮泥 100ml",
      nameEn: "VIVLTONE Super Clay 100ml",
      description: "Firm hold texturising matte paste · all hair types · 100ml.",
      imageUrl: "/shop/vivltone-super-clay-100ml.png",
      priceCents: 22800,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "vivltone-super-clay-100ml",
      nameZh: "VIVLTONE Super Clay 造型髮泥 100ml",
      nameEn: "VIVLTONE Super Clay 100ml",
      description: "Firm hold texturising matte paste · all hair types · 100ml.",
      imageUrl: "/shop/vivltone-super-clay-100ml.png",
      priceCents: 22800,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "vivaltone-puny-balancing-shampoo-750ml" },
    update: {
      nameZh: "VIVALTONE PUNY 平衡洗髮露 750ml",
      nameEn: "VIVALTONE PUNY Balancing Shampoo 750ml",
      description: "For fine / limp oily hair · pH 4.5–5.5 · 750ml · For professional use only.",
      imageUrl: "/shop/vivaltone-puny-balancing-shampoo-750ml.png",
      priceCents: 36800,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "vivaltone-puny-balancing-shampoo-750ml",
      nameZh: "VIVALTONE PUNY 平衡洗髮露 750ml",
      nameEn: "VIVALTONE PUNY Balancing Shampoo 750ml",
      description: "For fine / limp oily hair · pH 4.5–5.5 · 750ml · For professional use only.",
      imageUrl: "/shop/vivaltone-puny-balancing-shampoo-750ml.png",
      priceCents: 36800,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "perfect-spray-voc55-380ml" },
    update: {
      nameZh: "Perfect Spray 造型噴霧 380ml",
      nameEn: "Perfect Spray 380ml",
      description: "VOC 55 · environment-friendly formula · 380ml professional finishing spray.",
      imageUrl: "/shop/perfect-spray-380ml.png",
      priceCents: 18000,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "perfect-spray-voc55-380ml",
      nameZh: "Perfect Spray 造型噴霧 380ml",
      nameEn: "Perfect Spray 380ml",
      description: "VOC 55 · environment-friendly formula · 380ml professional finishing spray.",
      imageUrl: "/shop/perfect-spray-380ml.png",
      priceCents: 18000,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "vivltone-keraplex-360-hair-treatment-mask-500ml" },
    update: {
      nameZh: "VILLYTONE KX 360 結構重組護理 500ml",
      nameEn: "VILLYTONE KX 360 Hair Treatment Mask 500ml",
      description:
        "結構重組護理 · Keraplex 360+ · pH4 · 八種氨基酸 + 水解角蛋白 · 500ml / 17.6 OZ.",
      imageUrl: "/shop/vivltone-keraplex-360-hair-treatment-mask-500ml.png",
      priceCents: 50000,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "vivltone-keraplex-360-hair-treatment-mask-500ml",
      nameZh: "VILLYTONE KX 360 結構重組護理 500ml",
      nameEn: "VILLYTONE KX 360 Hair Treatment Mask 500ml",
      description:
        "結構重組護理 · Keraplex 360+ · pH4 · 八種氨基酸 + 水解角蛋白 · 500ml / 17.6 OZ.",
      imageUrl: "/shop/vivltone-keraplex-360-hair-treatment-mask-500ml.png",
      priceCents: 50000,
      currency: "mop",
    },
  });

  await prisma.product.upsert({
    where: { slug: "villytone-kx360-hair-treatment-lotion-500ml" },
    update: {
      nameZh: "VILLYTONE 強韌重組水 500ml",
      nameEn: "VILLYTONE Hair Treatment Lotion 500ml",
      description:
        "強韌重組水 · Keraplex 360+ · pH4 · 強化韌度、降鹼去異味 · 500ml / 17.6 OZ.",
      imageUrl: "/shop/villytone-kx360-hair-treatment-lotion-500ml.png",
      priceCents: 48000,
      currency: "mop",
      isActive: true,
    },
    create: {
      slug: "villytone-kx360-hair-treatment-lotion-500ml",
      nameZh: "VILLYTONE 強韌重組水 500ml",
      nameEn: "VILLYTONE Hair Treatment Lotion 500ml",
      description:
        "強韌重組水 · Keraplex 360+ · pH4 · 強化韌度、降鹼去異味 · 500ml / 17.6 OZ.",
      imageUrl: "/shop/villytone-kx360-hair-treatment-lotion-500ml.png",
      priceCents: 48000,
      currency: "mop",
    },
  });

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
