import { DM_Sans, Noto_Serif_TC, Playfair_Display } from "next/font/google";

/**
 * Single source of truth for webfonts. Loaded from the root layout so every route
 * (marketing, shop, admin) shares one type system instead of redeclaring fonts per page.
 *
 * Latin and CJK are loaded as separate families and composed into one stack in
 * `globals.css`: the Latin face is listed first, so the browser only reaches the CJK
 * face for glyphs Latin cannot render.
 */

/** Latin display face — headings, brand wordmark. */
export const fontDisplayLatin = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-latin",
});

/** Latin body face. */
export const fontSansLatin = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-latin",
});

/**
 * Traditional Chinese display face, to match the Latin serif voice in headings.
 *
 * `preload: false` and no `subsets` are deliberate: Google splits CJK into ~100
 * unicode-range chunks, so preloading would fetch far more than a page needs. Without
 * preload the browser downloads only the chunks whose characters actually appear.
 *
 * Only weight 600 is requested — every `heading-*` utility is semibold, and each extra
 * weight duplicates the whole ~100-file chunk set in the build output.
 */
export const fontDisplayCjk = Noto_Serif_TC({
  weight: "600",
  preload: false,
  display: "swap",
  variable: "--font-display-cjk",
});

export const fontVariables = [
  fontDisplayLatin.variable,
  fontSansLatin.variable,
  fontDisplayCjk.variable,
].join(" ");
