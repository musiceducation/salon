"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Keep CSS `scroll-behavior: smooth` for in-page anchors, but force instant
 * scroll on real route changes so /#contact → /products does not "slide".
 */
export function InstantRouteScroll() {
  const pathname = usePathname();

  useEffect(() => {
    function disableSmoothForRouteChange(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) {
        return;
      }
      if (normalizePath(url.pathname) === normalizePath(window.location.pathname)) {
        return;
      }
      // Disable before Next.js scrolls the new page into view.
      document.documentElement.style.scrollBehavior = "auto";
    }

    document.addEventListener("click", disableSmoothForRouteChange, true);
    return () => document.removeEventListener("click", disableSmoothForRouteChange, true);
  }, []);

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    const unlock = window.setTimeout(() => {
      html.style.scrollBehavior = "";
    }, 100);
    return () => {
      window.clearTimeout(unlock);
      html.style.scrollBehavior = "";
    };
  }, [pathname]);

  return null;
}
