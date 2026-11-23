"use client";

import { useEffect } from "react";

type W = Window & {
  dataLayer?: unknown[];
  gtag?: (...a: unknown[]) => void;
  fbq?: (...a: unknown[]) => void;
};

/**
 * Rastreio pronto para GA4 e Meta Pixel. Todo CTA tem data-cta, data-cta-section
 * e data-cta-service. Basta instalar o GA4/GTM e o Pixel (TODO: IDs do cliente).
 * Evento GA4: "whatsapp_click" · Evento Pixel: "Contact" (padrão para lead por WhatsApp).
 */
export function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element)?.closest?.("[data-cta]") as HTMLElement | null;
      if (!a) return;
      const w = window as W;
      const payload = {
        cta_section: a.dataset.ctaSection,
        cta_service: a.dataset.ctaService,
        cta_detail: a.dataset.ctaDetail,
      };
      (w.dataLayer ??= []).push({ event: "whatsapp_click", ...payload });
      w.gtag?.("event", "whatsapp_click", payload);
      w.fbq?.("track", "Contact", { content_category: payload.cta_service, content_name: payload.cta_section });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
