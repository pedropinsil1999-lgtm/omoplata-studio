import type { Metadata } from "next";
import { generalSans, instrumentSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fisioterapia, Massoterapia e Pilates em Resende/RJ | OMOPLATA Studio",
  description:
    "Fisioterapia, massoterapia e pilates em Resende/RJ. Performance, reequilíbrio e bem-estar. Agende sua avaliação pelo WhatsApp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${generalSans.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
