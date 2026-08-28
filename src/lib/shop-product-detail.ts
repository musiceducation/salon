/** PDP copy — Curly Shyll–style “decision zone” content keyed by product or category. */

import { staticShopCatalogForExport } from "@/data/shop-catalog-static";

type CategoryKey = "shampoo" | "conditioner" | "treatment" | "styling" | "uncategorized";

export type ProductDetailContent = {
  benefits: string[];
  howToUse: string[];
  /** 0–5 hold meter (styling products). */
  holdLevel?: number;
  /** 0–5 shine meter (styling products). */
  shineLevel?: number;
  salonPick?: boolean;
};

const PRODUCT_DETAILS: Record<string, { zh: ProductDetailContent; en: ProductDetailContent }> = {
  "static-villytone-kx360-hair-treatment-lotion-500ml": {
    zh: {
      salonPick: true,
      benefits: [
        "強化髮質韌度，增加質感彈性",
        "降鹼去異味，緩衝膨脹過急",
        "Keraplex 360+ · pH4 · 專業燙髮系統",
      ],
      howToUse: [
        "漂染後：直接噴於頭髮，停留 5–10 分鐘後沖水造型，增加光澤與柔韌",
        "焗油前：直接噴於頭髮，停留 5–10 分鐘，不用沖水即可上焗油加熱",
        "受損頭髮燙髮：適量加入一劑藥水，加強保護，提升韌度與彈性",
        "漂髮時：直接噴於頭髮，增強抵抗力，減少溶爛斷髮",
      ],
    },
    en: {
      salonPick: true,
      benefits: [
        "Strengthens hair toughness and elasticity",
        "Lowers alkalinity, reduces odour, and buffers rapid swelling",
        "Keraplex 360+ · pH4 · professional perm system",
      ],
      howToUse: [
        "After bleach/colour: spray on, wait 5–10 minutes, rinse, then style",
        "Before steam/oil treatment: spray on, wait 5–10 minutes; no rinse — apply treatment and heat",
        "Perming damaged hair: add a little to perm solution No. 1 for protection and elasticity",
        "During bleaching: spray on to strengthen resistance and reduce mushiness or breakage",
      ],
    },
  },
  "static-vivltone-keraplex-360-hair-treatment-mask-500ml": {
    zh: {
      salonPick: true,
      benefits: [
        "迅速填補髮質表皮空洞",
        "有效滲透皮質層，補充所需成份",
        "提升髮質彈性；輕盈柔順、不油膩，持久豐盈質感",
        "八種氨基酸 + 水解角蛋白（Keraplex 360+ · pH4）",
      ],
      howToUse: [
        "可按一般焗油流程使用；亦可居家代替護髮素",
        "塗抹後停留 5–10 分鐘，讓成份滲透，全面護理髮質",
        "尤其適合燙髮後使用，增加彈性與質感",
      ],
    },
    en: {
      salonPick: true,
      benefits: [
        "Quickly fills gaps in the hair cuticle",
        "Penetrates the cortex to replenish essential ingredients",
        "Boosts elasticity; lightweight, non-greasy, lasting body",
        "Eight amino acids + hydrolyzed keratin (Keraplex 360+ · pH4)",
      ],
      howToUse: [
        "Use after a standard oil/steam treatment, or at home in place of conditioner",
        "Leave 5–10 minutes for full penetration and texture care",
        "Especially after perming, to restore elasticity and body",
      ],
    },
  },
  "static-perfect-spray-voc55-380ml": {
    zh: {
      salonPick: true,
      holdLevel: 3,
      shineLevel: 4,
      benefits: [
        "輕盈定型，自然不黏膩",
        "適合日常造型與微濕髮感",
        "沙龍常用，延續店內造型效果",
      ],
      howToUse: [
        "搖勻後距離 20–30 cm 均勻噴於乾髮或微濕髮",
        "以手指或梳子整理想要的線條與蓬鬆度",
        "需要更強定型時可分層補噴",
      ],
    },
    en: {
      salonPick: true,
      holdLevel: 3,
      shineLevel: 4,
      benefits: [
        "Lightweight hold with a natural, non-sticky finish",
        "Works on dry or slightly damp hair for everyday styling",
        "Salon staple to extend your in-chair look at home",
      ],
      howToUse: [
        "Shake well; mist evenly 20–30 cm from dry or damp hair",
        "Shape with fingers or a comb for your desired finish",
        "Layer for stronger hold if needed",
      ],
    },
  },
  "static-vivltone-super-clay-100ml": {
    zh: {
      holdLevel: 4,
      shineLevel: 2,
      benefits: ["霧面質感，線條清晰", "重塑力佳，適合短髮及男士造型", "少量即可，易於推開"],
      howToUse: [
        "取 pea 大小於掌心搓開",
        "由髮根向髮尾抓出紋理與方向",
        "乾髮使用效果最佳",
      ],
    },
    en: {
      holdLevel: 4,
      shineLevel: 2,
      benefits: [
        "Matte texture with clean definition",
        "Re-workable hold for short cuts and men's styles",
        "A little goes a long way",
      ],
      howToUse: [
        "Rub a pea-sized amount between palms",
        "Work through dry hair from roots to ends",
        "Best on dry hair for maximum texture",
      ],
    },
  },
  "static-vivaltone-puny-balancing-shampoo-750ml": {
    zh: {
      benefits: ["平衡頭皮與髮絲水分", "溫和清潔，適合日常使用", "大容量，家庭或長期護理更划算"],
      howToUse: ["濕髮後取適量搓起泡", "按摩頭皮與髮幹，然後徹底沖淨", "可配合同系列護髮素使用"],
    },
    en: {
      benefits: [
        "Balances scalp and hair moisture",
        "Gentle daily cleanse",
        "Generous 750 ml size for long-term care",
      ],
      howToUse: [
        "Apply to wet hair and lather",
        "Massage scalp and lengths, then rinse thoroughly",
        "Follow with conditioner from the same range if desired",
      ],
    },
  },
};

const CATEGORY_FALLBACK: Record<
  CategoryKey,
  { zh: ProductDetailContent; en: ProductDetailContent }
> = {
  styling: {
    zh: {
      holdLevel: 3,
      shineLevel: 3,
      benefits: ["沙龍級造型效果", "易於日常使用及補塑型", "配合吹整效果更佳"],
      howToUse: ["取適量於掌心搓勻", "塗抹於需要造型的部位", "以梳子或手指整理完成"],
    },
    en: {
      holdLevel: 3,
      shineLevel: 3,
      benefits: [
        "Salon-grade styling performance",
        "Easy to apply and re-style through the day",
        "Pairs well with blow-drying",
      ],
      howToUse: [
        "Warm a small amount in your palms",
        "Apply where you want shape or hold",
        "Comb or finger-style to finish",
      ],
    },
  },
  shampoo: {
    zh: {
      benefits: ["專業洗護配方", "溫和清潔頭皮與髮絲", "延續沙龍護理效果"],
      howToUse: ["濕髮起泡清潔", "按摩後徹底沖淨", "建議配合護髮素"],
    },
    en: {
      benefits: ["Professional care formula", "Gentle scalp and hair cleanse", "Extends your salon routine"],
      howToUse: ["Lather on wet hair", "Rinse thoroughly", "Use with matching conditioner"],
    },
  },
  conditioner: {
    zh: {
      benefits: ["修護及順滑髮絲", "減少打結與毛躁", "洗後手感柔順"],
      howToUse: ["洗髮後塗於髮中至髮尾", "停留 1–3 分鐘", "以清水沖淨"],
    },
    en: {
      benefits: ["Smooths and detangles", "Reduces frizz", "Silky after-wash feel"],
      howToUse: ["Apply mid-lengths to ends after shampoo", "Leave 1–3 minutes", "Rinse well"],
    },
  },
  treatment: {
    zh: {
      benefits: ["集中修護受損或乾燥髮絲", "提升光澤與彈性", "適合週期性深層護理"],
      howToUse: ["取適量塗於毛巾抹乾的髮絲", "集中於髮尾或受損部位", "按產品說明停留後沖淨或免沖"],
    },
    en: {
      benefits: [
        "Targets dry or damaged areas",
        "Boosts shine and elasticity",
        "Ideal for periodic intensive care",
      ],
      howToUse: [
        "Apply to towel-dried hair",
        "Focus on ends or stressed zones",
        "Rinse or leave in per product directions",
      ],
    },
  },
  uncategorized: {
    zh: {
      benefits: ["藝能店內同售專業產品", "歡迎 WeChat 查詢用法", "到店試用更安心"],
      howToUse: ["請參考包裝說明", "如有疑問可於落單時留言", "造型師樂意提供建議"],
    },
    en: {
      benefits: [
        "Same professional range as in-salon retail",
        "Message us on WeChat for advice",
        "Try in salon for peace of mind",
      ],
      howToUse: [
        "Follow pack directions",
        "Add a note when ordering if unsure",
        "Our stylists are happy to guide you",
      ],
    },
  },
};

export function getProductDetailContent(
  productId: string,
  category: CategoryKey,
  locale: string,
  names?: { nameZh?: string; nameEn?: string },
): ProductDetailContent {
  const lang = locale === "zh-HK" ? "zh" : "en";
  const byId = PRODUCT_DETAILS[productId];
  if (byId) {
    return byId[lang];
  }
  const match = staticShopCatalogForExport.find(
    (p) => p.nameZh === names?.nameZh || p.nameEn === names?.nameEn,
  );
  if (match && PRODUCT_DETAILS[match.id]) {
    return PRODUCT_DETAILS[match.id][lang];
  }
  return CATEGORY_FALLBACK[category][lang];
}
