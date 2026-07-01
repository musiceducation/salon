import { DM_Sans, Playfair_Display } from "next/font/google";

export const salonDisplay = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const salonSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans-body",
});

export const salonFontVariables = `${salonDisplay.variable} ${salonSans.variable}`;
export const salonDisplayClassName = salonDisplay.className;
export const salonSansClassName = salonSans.className;
