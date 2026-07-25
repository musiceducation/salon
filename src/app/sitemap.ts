import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const trailingSlash = process.env.STATIC_EXPORT === "1";

function siteUrl(path: string) {
  if (path === "/") {
    return `${base}/`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return trailingSlash ? `${base}${normalized}/` : `${base}${normalized}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/zh-HK"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/en"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/zh-HK/products"), lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: siteUrl("/en/products"), lastModified, changeFrequency: "weekly", priority: 0.85 },
  ];
}
