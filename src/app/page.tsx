import { redirect } from "next/navigation";

/**
 * Fallback when locale middleware is not running (static export build).
 * Vercel serves Chinese at `/` via middleware rewrite to `/zh-HK`.
 * GitHub Pages CI copies `out/zh-HK/index.html` over this file so the live URL stays `/`.
 */
export default function Home() {
  redirect("/zh-HK");
}
