import localFont from "next/font/local";

// General Sans (Fontshare, ITF Free Font License: uso comercial liberado), self-hosted
export const generalSans = localFont({
  src: [
    { path: "../fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/GeneralSans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Instrument Serif Italic (Google Fonts, OFL), self-hosted
export const instrumentSerif = localFont({
  src: [{ path: "../fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" }],
  variable: "--font-instrument-serif",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "serif"],
});
