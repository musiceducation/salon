"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { swapLocaleHref } from "@/lib/locale-path";

type Props = {
  locale: string;
};

export function SalonLocaleSwitch({ locale }: Props) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") {
        return;
      }
      setHash(window.location.hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const enHref = swapLocaleHref(pathname, "en", hash);
  const zhHref = swapLocaleHref(pathname, "zh-HK", hash);

  return (
    <div className="ml-0 flex gap-0.5 pl-0.5 text-xs sm:ml-1 sm:text-sm">
      {locale === "en" ? (
        <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-900">EN</span>
      ) : (
        <Link
          className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
          href={enHref}
        >
          EN
        </Link>
      )}
      {locale === "zh-HK" ? (
        <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-900">繁</span>
      ) : (
        <Link
          className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
          href={zhHref}
        >
          繁
        </Link>
      )}
    </div>
  );
}
