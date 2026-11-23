import type { Metadata, Viewport } from "next";
import { generalSans, instrumentSerif } from "./fonts";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { FieldLayer } from "@/components/field/FieldLayer";
import { Preloader, preloaderScript } from "@/components/chrome/Preloader";
import { Nav } from "@/components/chrome/Nav";
import { BookingSheet } from "@/components/chrome/Booking";
import { FloatingWhatsApp } from "@/components/chrome/FloatingWhatsApp";
import { Cursor } from "@/components/chrome/Cursor";
import { Analytics } from "@/components/chrome/Analytics";
import { Curtain } from "@/components/chrome/PageTransition";
import { SITE } from "@/lib/site";
import "./globals.css";

const title = "Fisioterapia, Massoterapia e Pilates em Resende/RJ | OMOPLATA Studio";
const description =
  "Fisioterapia, massoterapia e pilates em Resende/RJ. Tratamos a dor, devolvemos o movimento e acompanhamos atletas. 5,0 no Google. Agende pelo WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE.name,
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OMOPLATA Studio: Performance, Reequilíbrio e Bem-estar" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  icons: {
    icon: [
      { url: "/brand/omoplata-simbolo.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1F24",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "PhysicalTherapy",
  "@id": `${SITE.url}/#estudio`,
  name: SITE.name,
  description,
  url: SITE.url,
  telephone: "+55 24 99922-4435",
  image: `${SITE.url}/og.png`,
  logo: `${SITE.url}/brand/omoplata-simbolo.svg`,
  priceRange: "$$", // TODO: confirmar faixa de preço
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street, // TODO
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    postalCode: SITE.address.zip, // TODO
    addressCountry: "BR",
  },
  areaServed: { "@type": "City", name: "Resende" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: SITE.rating.count, bestRating: "5" },
  sameAs: [SITE.instagram],
  availableService: [
    { "@type": "MedicalTherapy", name: "Fisioterapia" },
    { "@type": "MedicalTherapy", name: "Massoterapia" },
    { "@type": "ExercisePlan", name: "Pilates" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${generalSans.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-bone focus:px-4 focus:py-3 focus:text-petrol-950">
          Pular para o conteúdo
        </a>
        <SmoothScroll>
          <Preloader />
          <FieldLayer />
          <Nav />
          {children}
          <BookingSheet />
          <FloatingWhatsApp />
          <Cursor />
          <Curtain />
          <Analytics />
        </SmoothScroll>
      </body>
    </html>
  );
}
