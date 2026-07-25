import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: "藝能美髮培訓中心 | n_nsalon",
  description:
    "澳門美髮沙龍：染燙、剪護、沙龍產品；線上預約、到店體驗。藝能美髮培訓中心 n_nsalon，自 1993 扎根澳門。",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className={`h-full antialiased ${fontVariables}`}>
      <body className="min-h-full flex flex-col">
        <a className="skip-to-main" href="#main-content">
          跳至主內容 <span className="text-zinc-400">·</span> Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
