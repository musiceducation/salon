# Patterns — common mistakes on this repo

When **fixing** a user’s rough prompt for this project, watch for:

1. **Strings only in one locale** — zh-HK and `en` must stay paired for site copy.
2. **Shop drift** — seed / static catalog / demo API list out of sync after a product edit.
3. **Static export assumptions** — `output: export` build has no `/api`; shop uses WhatsApp/email fallback when `NEXT_PUBLIC_STATIC_EXPORT=1`.
4. **Price list duplication** — same service priced twice in “quick ref” and tables; merge into `price-list.ts` sections.
5. **Unscoped Cursor prompts** — “fix the site” → narrow to file + done-when + do-not-touch.

Fold these into the **Constraints** or **Do not** section of the generated prompt when relevant.
