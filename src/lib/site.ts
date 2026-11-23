// Dados do negócio num só lugar. Tudo marcado com TODO precisa de confirmação do cliente.

export const SITE = {
  name: "OMOPLATA Studio",
  url: "https://omoplatastudio.com.br", // TODO: confirmar domínio final
  phoneE164: "5524999224435",
  phoneDisplay: "(24) 99922-4435",
  instagram: "https://www.instagram.com/omoplatastudio/", // TODO: confirmar @ do Instagram
  rating: { value: 5.0, count: 123 },
  address: {
    // TODO: confirmar endereço completo do Omoplata Hub
    street: "Rua [nome], [número]",
    district: "[Bairro]",
    city: "Resende",
    state: "RJ",
    zip: "27500-000",
  },
  // TODO: confirmar horário de funcionamento
  hours: [
    { days: "Segunda a sexta", time: "7h às 21h" },
    { days: "Sábado", time: "8h às 12h" },
  ],
  // TODO: nome e CREFITO do responsável técnico
  technicalLead: { name: "[Nome do responsável]", crefito: "[número]" },
  mapsQuery: "OMOPLATA Studio, Resende - RJ", // TODO: trocar pelo endereço exato quando confirmado
} as const;

export type Service = "fisioterapia" | "massoterapia" | "pilates" | "presente";

export const DOORS = {
  fisioterapia: {
    label: "Avaliação de fisioterapia",
    short: "Fisioterapia",
    message: "Olá! Vim pelo site e quero agendar uma avaliação de fisioterapia.",
  },
  massoterapia: {
    label: "Sessão de massagem",
    short: "Massagem",
    message: "Olá! Vim pelo site e quero agendar uma sessão de massagem.",
  },
  pilates: {
    label: "Aula experimental de pilates",
    short: "Pilates",
    message: "Olá! Vim pelo site e quero agendar uma aula experimental de pilates.",
  },
} as const satisfies Record<Exclude<Service, "presente">, { label: string; short: string; message: string }>;

export const GIFT_MESSAGE = "Olá! Quero dar uma sessão de massagem de presente.";

export const wa = (message: string) => `https://wa.me/${SITE.phoneE164}?text=${encodeURIComponent(message)}`;

/**
 * Atributos de rastreio de todo CTA. O listener em <Analytics /> lê esses
 * data-attributes e envia para GA4 (gtag/dataLayer) e Meta Pixel (fbq) se existirem.
 */
export const ctaData = (section: string, service: Service | "geral", extra?: string) => ({
  "data-cta": "whatsapp",
  "data-cta-section": section,
  "data-cta-service": service,
  ...(extra ? { "data-cta-detail": extra } : {}),
});
