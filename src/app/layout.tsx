import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "藝能美髮培訓中心 | n_nsalon",
  description:
    "Professional salon website with online booking, product shop, and bilingual brand experience.",
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
