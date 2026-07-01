import type { ReactNode } from "react";
import { salonFontVariables } from "@/lib/salon-fonts";

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${salonFontVariables} [font-family:var(--font-sans-body),ui-sans-serif,system-ui,sans-serif]`}
    >
      {children}
    </div>
  );
}
