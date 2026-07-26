import type { MetadataRoute } from "next";
import { localeAbsoluteUrl } from "@/lib/locale-path";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: localeAbsoluteUrl(base, "zh-HK"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: localeAbsoluteUrl(base, "en"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: localeAbsoluteUrl(base, "zh-HK", "products"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: localeAbsoluteUrl(base, "en", "products"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];
}
