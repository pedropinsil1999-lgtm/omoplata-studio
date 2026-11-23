"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { SITE } from "@/lib/site";

// TODO: trocar por avaliações reais do Google (texto e nome autorizados).
// Os autores estão entre colchetes de propósito: nada aqui deve ir ao ar como avaliação real.
const ROW_A = [
  { t: "Cheguei travada de dor na lombar e saí andando leve. Atendimento atencioso do começo ao fim.", a: "[Nome] · Google" },
  { t: "A massagem é outro nível. Virou meu momento fixo do mês.", a: "[Nome] · Google" },
  { t: "Faço pilates há meses e minha postura mudou de verdade. O espaço é lindo.", a: "[Nome] · Google" },
  { t: "Me recuperei de uma lesão no ombro a tempo do campeonato de beach tennis.", a: "[Nome] · Google" },
];
const ROW_B = [
  { t: "Explicam tudo sem complicar. Você entende o que está tratando.", a: "[Nome] · Google" },
  { t: "Dei uma sessão de massagem de presente para minha mãe. Ela amou.", a: "[Nome] · Google" },
  { t: "Ambiente calmo, pontual e muito cuidadoso. Recomendo de olhos fechados.", a: "[Nome] · Google" },
  { t: "O pescoço vivia tenso. Hoje eu sei o que fazer para não voltar.", a: "[Nome] · Google" },
];

function Card({ t, a }: { t: string; a: string }) {
  return (
    <figure className="mx-2 w-[min(78vw,420px)] shrink-0 rounded-[24px] border border-petrol-950/10 bg-white/60 p-6 md:mx-3 md:p-7">
      <p aria-hidden className="text-sm tracking-[0.2em] text-violet-500">
        ★★★★★
      </p>
      <blockquote className="mt-3 text-lead text-petrol-950">{t}</blockquote>
      <figcaption className="mt-5 text-sm text-petrol-700">{a}</figcaption>
    </figure>
  );
}

export function Depoimentos() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-count]");
      els.forEach((el) => {
        const end = Number(el.dataset.count);
        const dec = Number(el.dataset.dec ?? 0);
        const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (prefersReducedMotion()) return void (el.textContent = fmt(end));
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => void (el.textContent = fmt(o.v)),
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="depoimentos"
      ref={root}
      aria-labelledby="dep-title"
      className="grain relative z-10 overflow-hidden bg-bone py-[clamp(96px,12vw,170px)] text-petrol-950"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-12 md:items-end md:px-8">
        <div className="md:col-span-6">
          <p className="mb-5 text-eyebrow uppercase text-violet-500">Depoimentos</p>
          <Reveal as="h2" id="dep-title" className="text-h1">
            Quem vem, <span className="impact text-violet-500">volta.</span>
          </Reveal>
        </div>
        <div className="flex items-end gap-6 md:col-span-6 md:justify-end">
          <p className="text-stat text-petrol-950">
            <span data-count={SITE.rating.value} data-dec="1" aria-hidden>
              5,0
            </span>
            <span className="sr-only">Nota {SITE.rating.value.toFixed(1).replace(".", ",")} no Google</span>
          </p>
          <div className="pb-2 md:pb-4">
            <p aria-hidden className="text-xl tracking-[0.2em] text-violet-500">
              ★★★★★
            </p>
            <p className="mt-1 text-lead font-semibold">no Google</p>
            <p className="text-petrol-700">
              <span data-count={SITE.rating.count} className="tabular-nums">
                {SITE.rating.count}
              </span>{" "}
              avaliações
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:mt-24 md:gap-6">
        <Marquee speed={38} label="Avaliações de pacientes">
          {ROW_A.map((r, i) => (
            <Card key={i} {...r} />
          ))}
        </Marquee>
        <Marquee speed={32} reverse label="Mais avaliações de pacientes">
          {ROW_B.map((r, i) => (
            <Card key={i} {...r} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
