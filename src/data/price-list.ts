import type { Locale } from "@/lib/i18n";

function L(zhHK: string, en: string, locale: Locale): string {
  return locale === "zh-HK" ? zhHK : en;
}

/** Member vs non-member table. */
export type PriceCompareSection = {
  kind: "compare-table";
  id: string;
  title: string;
  note?: string;
  colMember: string;
  colGuest: string;
  rows: { service: string; member: string; guest: string }[];
};

/** Grouped lines (membership packages). */
export type PriceMembershipSection = {
  kind: "membership";
  id: string;
  title: string;
  groups: { heading: string; lines: string[] }[];
  footnotes: string[];
};

/** Nano scalp promo: bullets + price blocks. */
export type PriceNanoSection = {
  kind: "nano";
  id: string;
  title: string;
  lead: string;
  bullets: string[];
  priceBlocks: { subtitle: string; rows: { label: string; value: string }[] }[];
  courseCards: { label: string; value: string }[];
  promoLine: string;
  contactLine: string;
};

/** Nested compare blocks (cut & colour detail). */
export type PriceDyeCutSection = {
  kind: "dye-cut";
  id: string;
  title: string;
  note?: string;
  blocks: {
    subtitle?: string;
    colMember: string;
    colGuest: string;
    rows: { label: string; member: string; guest: string }[];
  }[];
};

/** Event / makeup list. */
export type PriceEventsSection = {
  kind: "events";
  id: string;
  title: string;
  rows: { name: string; price: string }[];
  addon?: string;
};

export type PriceListSection =
  | PriceCompareSection
  | PriceMembershipSection
  | PriceNanoSection
  | PriceDyeCutSection
  | PriceEventsSection;

export type PriceListData = {
  sections: PriceListSection[];
};

export function getPriceListData(locale: Locale): PriceListData {
  return {
    sections: [
      {
        kind: "dye-cut",
        id: "cut-colour-detail",
        title: L("剪髮 · 染髮（會員 / 非會員）", "Cuts & colour (member / non-member)", locale),
        note: L(
          "使用本店焗油每次加 $50。",
          "+$50 per in-salon oil treatment application.",
          locale,
        ),
        blocks: [
          {
            subtitle: L("基本項目", "Basics", locale),
            colMember: L("會員", "Member", locale),
            colGuest: L("非會員", "Non-member", locale),
            rows: [
              {
                label: L("洗頭（單洗）", "Shampoo only", locale),
                member: "$100",
                guest: "$100",
              },
              {
                label: L("剪髮（洗剪）", "Cut (wash & cut)", locale),
                member: "$90",
                guest: "$170",
              },
              {
                label: L("小童剪髮（不洗）", "Kids cut (no wash)", locale),
                member: "$100",
                guest: "$100",
              },
              {
                label: L("扎辮", "Braiding", locale),
                member: "$200 " + L("起", "up", locale),
                guest: "$250 " + L("起", "up", locale),
              },
              {
                label: L("焗油", "Oil treatment", locale),
                member: "$300 " + L("起", "up", locale),
                guest: "$360 " + L("起", "up", locale),
              },
              {
                label: L("搪瓷卷筒", "Ceramic rollers", locale),
                member: "$200 " + L("起", "up", locale),
                guest: "$260 " + L("起", "up", locale),
              },
            ],
          },
          {
            subtitle: L("染髮 · 短髮", "Colour · short hair", locale),
            colMember: L("會員", "Member", locale),
            colGuest: L("非會員", "Non-member", locale),
            rows: [
              {
                label: L("正染根", "Root colour", locale),
                member: "$400",
                guest: "$470",
              },
              {
                label: L("抽染全頭 + 根", "Full highlights + roots", locale),
                member: "$490",
                guest: "$570",
              },
              {
                label: L("沐浴染色", "Bath colour", locale),
                member: "$200 " + L("起", "up", locale),
                guest: "$280 " + L("起", "up", locale),
              },
              {
                label: L("正抽漂", "Bleach highlights", locale),
                member: "$290",
                guest: "$350",
              },
              {
                label: L("染灰色", "Grey colour", locale),
                member: "$700 " + L("起", "up", locale),
                guest: "$700 " + L("起", "up", locale),
              },
            ],
          },
          {
            subtitle: L("染髮 · 長髮", "Colour · long hair", locale),
            colMember: L("會員", "Member", locale),
            colGuest: L("非會員", "Non-member", locale),
            rows: [
              {
                label: L("正染根（按長度）", "Root colour (by length)", locale),
                member: "$430–$490 " + L("起", "up", locale),
                guest: "$510–$570 " + L("起", "up", locale),
              },
              {
                label: L("抽染全頭 + 根", "Full highlights + roots", locale),
                member: "$540–$590 " + L("起", "up", locale),
                guest: "$610–$670 " + L("起", "up", locale),
              },
              {
                label: L("正抽漂", "Bleach highlights", locale),
                member: "$330 " + L("起", "up", locale),
                guest: "$390 " + L("起", "up", locale),
              },
            ],
          },
          {
            subtitle: L("其他", "Other", locale),
            colMember: L("會員", "Member", locale),
            colGuest: L("非會員", "Non-member", locale),
            rows: [
              {
                label: L("全漂／退色", "Full bleach / colour removal", locale),
                member: L("首次 $200；其後每次 +$150 起", "First $200; then +$150 up per session", locale),
                guest: L("首次 $200；其後每次 +$150 起", "First $200; then +$150 up per session", locale),
              },
              {
                label: L("染後護理", "Post-colour care", locale),
                member: "+$30",
                guest: "+$50",
              },
            ],
          },
        ],
      },
      {
        kind: "compare-table",
        id: "perm-tech-compare",
        title: L("電髮及護理直髮（會員 / 非會員）", "Perm & straightening (member / non-member)", locale),
        colMember: L("會員", "Member", locale),
        colGuest: L("非會員", "Non-member", locale),
        rows: [
          {
            service: L("電髮（三級）", "Perm (3 tiers)", locale),
            member: "$690 / $790 / $890",
            guest: "$780 / $880 / $980",
          },
          {
            service: L("電髮加藥（加強／水療等）", "Perm add-ons (plus / treatment / water)", locale),
            member: "+$250 / +$300 / +$350",
            guest: "+$250 / +$300 / +$350",
          },
          {
            service: L("半個頭或電根", "Partial / root perm", locale),
            member: "$500",
            guest: "$660",
          },
          {
            service: L("游離子負離子直髮", "Ionic straightening", locale),
            member: "$900",
            guest: "$980",
          },
          {
            service: L("電後護理", "Post-perm care", locale),
            member: "+$30",
            guest: "+$50",
          },
          {
            service: L("韓式低溫搪瓷燙髮", "Korean low-temp ceramic perm", locale),
            member: "$820",
            guest: "$920",
          },
          {
            service: L("美國果酸蛋白護理直髮", "USA fruit-acid protein straightening", locale),
            member: "$880",
            guest: "$980",
          },
          {
            service: L("日本蛋白修護縮髮矯正直髮", "Japan protein correction straightening", locale),
            member: "$1,200",
            guest: "$1,380",
          },
          {
            service: L("KK 絲蛋白重塑護理直髮", "KK silk protein reshaping", locale),
            member: "$1,600",
            guest: "$1,800",
          },
          {
            service: L("韓式低溫搪瓷電髮 + 直髮", "Korean ceramic perm + straight", locale),
            member: "$1,600",
            guest: "$1,800 " + L("起", "up", locale),
          },
        ],
      },
      {
        kind: "membership",
        id: "membership-cards",
        title: L("開會員卡 / 套票", "Membership & prepaid cards", locale),
        groups: [
          {
            heading: L("1 個月", "1 month", locale),
            lines: ["$630 / 10 次", "$380 / 5 次", "$925 / 15 次"],
          },
          {
            heading: L("2 個月", "2 months", locale),
            lines: ["$660 / 10 次", "$975 / 15 次"],
          },
          {
            heading: L("3 個月", "3 months", locale),
            lines: ["$690 / 10 次"],
          },
          {
            heading: L("焗油卡（須於本店購買焗油）", "Oil-treatment card (oil purchased in-salon)", locale),
            lines: [L("3 個月 $680 / 6 次", "3 mo $680 / 6 visits", locale), L("6 個月 $1,020 / 10 次", "6 mo $1,020 / 10 visits", locale)],
          },
        ],
        footnotes: [
          L(
            "納米秀髮／頭皮療程套票見下方「韓國納米養髮·頭皮護理」。",
            "Nano hair & scalp course packages are in the Korean nano hair & scalp care section below.",
            locale,
          ),
          L(
            "增值 $2,000 可作現金使用（如洗頭等以會員價扣減）。遺失或過期卡恕不補發。",
            "$2,000 top-up works like cash at member prices. Lost/expired cards are not replaced.",
            locale,
          ),
        ],
      },
      {
        kind: "nano",
        id: "nano-scalp",
        title: L("韓國納米養髮 · 頭皮護理", "Korean nano hair & scalp care", locale),
        lead: L(
          "藝能美髮培訓中心現推出韓國納米養髮頭皮護理，針對頭皮與毛囊環境。",
          "Nano hair and scalp care programme focused on scalp and follicle health.",
          locale,
        ),
        bullets: [
          L(
            "激活毛囊，修復受損，補充營養，溶解污垢，刺激穴位，緊致頭皮。",
            "Supports follicles, repair, nutrition, cleansing, acupressure points, firmer scalp.",
            locale,
          ),
          L(
            "止癢去屑，消炎抑菌，調理頭皮炎症，水油平衡，清爽舒適。",
            "Itch & flake relief, balance oil/moisture, fresh comfort.",
            locale,
          ),
          L(
            "去頭皮、去角質、溶解硅油積聚、深層排毒，恢復頭皮「呼吸」。",
            "Exfoliation, silicone build-up, deep cleanse, healthier scalp surface.",
            locale,
          ),
          L(
            "促進頭皮血液循環，幫助毛囊代謝更新。",
            "Scalp circulation and follicle metabolism.",
            locale,
          ),
          L(
            "優化生長環境，增加頭皮彈性；有助面頰線條緊致。",
            "Growth environment, scalp elasticity; lifting effect on facial contour.",
            locale,
          ),
          L(
            "預防脫髮、斷髮，強韌髮根，持久順滑光澤。",
            "Reduce breakage; stronger roots, smoother shine.",
            locale,
          ),
        ],
        priceBlocks: [
          {
            subtitle: L("非會員", "Non-member", locale),
            rows: [
              {
                label: L("納米秀髮修復 + 頭皮療養 · 短髮", "Nano repair + scalp · short", locale),
                value: "$420",
              },
              {
                label: L("納米秀髮修復 + 頭皮療養 · 長髮", "Nano repair + scalp · long", locale),
                value: "$480",
              },
            ],
          },
          {
            subtitle: L("會員（於本店購買焗油）", "Member (oil purchased in-salon)", locale),
            rows: [
              {
                label: L("納米秀髮修復 + 頭皮療養", "Nano repair + scalp", locale),
                value: "$300",
              },
              {
                label: L("短髮", "Short", locale),
                value: "$360",
              },
              {
                label: L("長髮", "Long", locale),
                value: "$420",
              },
            ],
          },
        ],
        courseCards: [
          { label: L("療程卡 6 個月 · 6 次", "6 months · 6 sessions", locale), value: "$1,800" },
          { label: L("療程卡 6 個月 · 10 次", "6 months · 10 sessions", locale), value: "$2,800" },
        ],
        promoLine: L(
          "凡做納米養髮頭皮護理，送頭皮檢驗。",
          "Complimentary scalp check with nano scalp care service.",
          locale,
        ),
        contactLine: L(
          "預約：28304175 / +853 66509780（WeChat 或致電）",
          "Book: 28304175 / +853 66509780 (WeChat or call)",
          locale,
        ),
      },
      {
        kind: "events",
        id: "makeup-events",
        title: L("粵曲 · 宴會 · 新娘化妝造型", "Opera, events & bridal styling", locale),
        rows: [
          {
            name: L("粵曲表演及宴會 — 化妝 + 頭", "Cantonese opera & banquet — makeup + hair", locale),
            price: "$600 " + L("起", "up", locale),
          },
          {
            name: L("粵曲表演及宴會 — 化妝或頭（單項）", "Opera & banquet — makeup or hair", locale),
            price: "$350 " + L("起", "up", locale),
          },
          {
            name: L("外出粵曲表演及宴會 — 化妝 + 頭", "On-location opera & banquet — makeup + hair", locale),
            price: "$650 " + L("起", "up", locale),
          },
          {
            name: L("外出粵曲表演及宴會 — 化妝或頭", "On-location — makeup or hair", locale),
            price: "$350 " + L("起", "up", locale),
          },
          {
            name: L("奶奶及外母宴會 — 化妝 + 頭", "Mother / MIL banquet — makeup + hair", locale),
            price: "$1,000",
          },
          {
            name: L("奶奶及外母宴會 — 化妝或頭", "Mother / MIL — makeup or hair", locale),
            price: "$500 " + L("起", "up", locale),
          },
          {
            name: L("新娘 — 化妝 + 頭", "Bride — makeup + hair", locale),
            price: "$1,800",
          },
          {
            name: L("新娘 — 早 + 晚兩造", "Bride — morning & evening", locale),
            price: "$3,000 " + L("起", "up", locale),
          },
          {
            name: L("新娘 — 全日服務", "Bride — full day", locale),
            price: "$6,200 " + L("起", "up", locale),
          },
          {
            name: L("伴娘及其他 — 化妝 + 頭", "Bridesmaids & others — makeup + hair", locale),
            price: "$650 " + L("起", "up", locale),
          },
        ],
        addon: L("假眼睫毛 +$30", "False lashes +$30", locale),
      },
    ],
  };
}
