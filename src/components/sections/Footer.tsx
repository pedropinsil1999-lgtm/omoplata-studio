"use client";

import { useRef } from "react";
import { useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { LogoSymbol, Wordmark, drawSymbol } from "@/components/brand/Logo";
import { SITE, ctaData, wa } from "@/lib/site";

export function Footer() {
  const sym = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion() || !sym.current) return;
    const st = ScrollTrigger.create({
      trigger: sym.current,
      start: "top 95%",
      once: true,
      onEnter: () => drawSymbol(sym.current!, { speed: 1.2 }),
    });
    return () => st.kill();
  });
  const a = SITE.address;
  const year = 2026;
  return (
    <footer className="relative z-10 border-t border-bone/10 bg-petrol-950 px-4 pb-[max(28px,env(safe-area-inset-bottom))] pt-16 md:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-4">
            <LogoSymbol ref={sym} className="size-14" title="OMOPLATA" />
            <Wordmark className="h-4 w-auto text-bone" />
          </div>
          <p className="mt-5 max-w-[30ch] text-petrol-300">Performance, reequilíbrio e bem-estar. O corpo em harmonia.</p>
        </div>
        <nav aria-label="Contato" className="grid gap-2 md:col-span-3">
          <p className="text-eyebrow uppercase text-petrol-300">Fale com a gente</p>
          <a href={wa("Olá! Vim pelo site.")} target="_blank" rel="noopener" {...ctaData("rodape", "geral")} className="w-fit hover:text-aqua-400">
            WhatsApp {SITE.phoneDisplay}
          </a>
          <a href={SITE.instagram} target="_blank" rel="noopener" className="w-fit hover:text-aqua-400">
            Instagram
          </a>
        </nav>
        <div className="md:col-span-3">
          <p className="text-eyebrow uppercase text-petrol-300">Omoplata Hub</p>
          <address className="mt-2 not-italic text-bone/85">
            {a.street}, {a.district}
            <br />
            {a.city}/{a.state} · CEP {a.zip}
          </address>
        </div>
        <div className="md:col-span-2 md:text-right">
          <p className="text-eyebrow uppercase text-petrol-300">Atendimento</p>
          <p className="mt-2 text-bone/85">Fisioterapia · Massoterapia · Pilates</p>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-bone/10 pt-6 text-sm text-petrol-300 md:flex-row">
        {/* TODO: nome e CREFITO do responsável técnico */}
        <p>
          Responsável técnico: {SITE.technicalLead.name} · CREFITO {SITE.technicalLead.crefito}
        </p>
        <p>
          © {year} {SITE.name} · Resende/RJ
        </p>
      </div>
    </footer>
  );
}
