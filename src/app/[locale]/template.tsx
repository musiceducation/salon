"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Soft fade on client navigations only. The first mount stays opaque so the hero can
 * paint as LCP. A later mount (App Router remounts templates) fades in. The flag is
 * set after the effect commits so React Strict Mode's setup/cleanup/setup cycle does
 * not fade the landing view, and the class is applied in state so server and client
 * markup match.
 */
let navReady = false;

export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  const [play, setPlay] = useState(false);

  useLayoutEffect(() => {
    if (navReady) setPlay(true);
    let alive = true;
    queueMicrotask(() => {
      if (alive) navReady = true;
    });
    return () => {
      alive = false;
    };
  }, []);

  return <div className={play ? "page-enter" : undefined}>{children}</div>;
}
