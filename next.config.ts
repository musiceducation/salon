import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** This repo’s project root (avoids wrong Turbopack root when another lockfile exists higher up). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
/** Pin Tailwind so `@import "tailwindcss"` does not resolve from a parent folder (e.g. ~/Desktop). */
const tailwindPkg = path.join(projectRoot, "node_modules", "tailwindcss");

/** Set STATIC_EXPORT=1 for GitHub Pages (static files only, no /api, no Prisma/SSR on the host). */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  env: {
    /** Baked at build: client uses this when `output: export` (GitHub Pages has no /api checkout). */
    NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "1" : "",
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindPkg,
    },
  },
  ...(isStaticExport && {
    output: "export" as const,
    /** Custom domain (e.g. www.nnsalon.com) is served at host root; omit basePath so `/zh-HK/` and `/_next/` resolve. */
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
