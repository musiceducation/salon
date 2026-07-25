# Templates — 藝能 / n_nsalon

## Cursor — small UI change (bilingual)

```
File: src/app/[locale]/page.tsx (or exact path)
Task: [e.g. Change hero CTA label]

Requirements:
- Update user-visible strings only in messages/zh-HK.json and messages/en.json (add keys if needed).
- Use getMessages / existing t.* pattern; do not hardcode Chinese or English in TSX unless already the pattern there.
- Done when: both /zh-HK and /en show the new text; npm run build passes.

Do not: change Prisma, API routes, or workflow YAML unless explicitly required.
```

## Cursor — shop product / price

```
Task: [Add SKU | change price | fix image path]

Touch in sync:
- prisma/seed.ts (if DB-backed)
- src/data/shop-catalog-static.ts (STATIC_EXPORT catalog)
- public/shop/*.png as needed
- src/app/api/shop/products/route.ts demoProducts if present

Done when: build passes; static catalog row count and SKUs match seed intent; zh-HK + en names consistent with messages/shop copy patterns.
```

## Cursor — price list section

```
Files: src/data/price-list.ts, src/components/price-list-section.tsx
Task: [e.g. Merge rows, fix layout, add section]

Constraints: Avoid duplicating prices across intro vs tables; keep section ids for anchors; light theme (white cards) matches home sections.

Done when: [visual + content checks]; npm run build passes.
```

## Non-Cursor tools

For Midjourney, ComfyUI, Zapier, etc., name the tool in chat — the main SKILL.md routes briefly; expand only when needed.
