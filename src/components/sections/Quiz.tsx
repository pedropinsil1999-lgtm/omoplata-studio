"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";
import { Spine, type Region } from "@/components/spine/Spine";
import { Door } from "@/components/ui/Magnetic";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";

type Answer = {
  region: Exclude<Region, "nenhuma">;
  label: string;
  lines: [string, string];
  service: "fisioterapia" | "massoterapia" | "pilates";
  serviceLabel: string;
  cta: string;
  message: string;
};

const ANSWERS: Answer[] = [
  {
    region: "pescoco",
    label: "Pescoço",
    lines: [
      "Pescoço tenso quase sempre é postura e estresse acumulado nos ombros.",
      "A gente alivia a dor e corrige o que faz ela voltar.",
    ],
    service: "fisioterapia",
    serviceLabel: "Fisioterapia + massoterapia",
    cta: "Agendar avaliação",
    message: "Olá! Vim pelo site, sinto dor no pescoço e quero agendar uma avaliação.",
  },
  {
    region: "ombros",
    label: "Ombros",
    lines: ["Ombro pesado e travado é tensão que o corpo guardou.", "Massagem e liberação devolvem leveza já na primeira sessão."],
    service: "massoterapia",
    serviceLabel: "Massoterapia",
    cta: "Agendar sessão",
    message: "Olá! Vim pelo site, sinto tensão nos ombros e quero agendar uma sessão de massagem.",
  },
  {
    region: "lombar",
    label: "Lombar",
    lines: ["A lombar segura o corpo inteiro e reclama quando algo sai do eixo.", "Na avaliação a gente acha a causa, não só o sintoma."],
    service: "fisioterapia",
    serviceLabel: "Fisioterapia",
    cta: "Agendar avaliação",
    message: "Olá! Vim pelo site, sinto dor na lombar e quero agendar uma avaliação.",
  },
  {
    region: "coluna",
    label: "A coluna toda / postura",
    lines: ["Postura não se corrige na força de vontade: se constrói com força e consciência.", "O pilates alinha a coluna inteira, no seu ritmo."],
    service: "pilates",
    serviceLabel: "Pilates",
    cta: "Agendar aula experimental",
    message: "Olá! Vim pelo site, quero melhorar minha postura e agendar uma aula experimental de pilates.",
  },
  {
    region: "performance",
    label: "Não sinto dor, quero performance",
    lines: ["Ótimo: é a melhor hora para cuidar.", "Prevenção e força para render mais no beach tennis e em qualquer esporte."],
    service: "fisioterapia",
    serviceLabel: "Fisioterapia esportiva + pilates",
    cta: "Agendar avaliação",
    message: "Olá! Vim pelo site, não sinto dor mas quero melhorar minha performance. Quero agendar uma avaliação.",
  },
];

export function Quiz() {
  const root = useRef<HTMLElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<Answer | null>(null);

  const choose = (r: Region) => {
    const a = ANSWERS.find((x) => x.region === r) ?? null;
    setPick(a);
  };

  useGSAP(
    () => {
      if (!pick || prefersReducedMotion()) return;
      gsap.fromTo(
        result.current!.querySelectorAll("[data-q]"),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: "expo.out" },
      );
    },
    { dependencies: [pick?.region], scope: root },
  );

  return (
    <section
      id="onde-doi"
      ref={root}
      aria-labelledby="quiz-title"
      className="grain relative z-10 bg-bone px-4 py-[clamp(96px,12vw,170px)] text-petrol-950 md:px-8"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="mb-5 text-eyebrow uppercase text-violet-500">Mapa do corpo</p>
          <Reveal as="h2" id="quiz-title" className="text-h1">
            Onde <span className="impact text-violet-500">dói?</span>
          </Reveal>
          <p className="mt-6 max-w-[34ch] text-lead text-petrol-700">
            Escolha a região. A gente te mostra o caminho e já deixa a mensagem pronta.
          </p>

          <div role="group" aria-label="Escolha a região" className="mt-10 flex flex-wrap gap-2.5">
            {ANSWERS.map((a) => {
              const on = pick?.region === a.region;
              return (
                <button
                  key={a.region}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(a.region)}
                  className={cn(
                    "group inline-flex h-12 items-center gap-2.5 rounded-[16px] border px-4 text-[0.95rem] font-semibold transition-colors duration-300",
                    on
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-petrol-950/15 bg-white/50 hover:border-petrol-950 hover:bg-white",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-2.5 rounded-[34%] border-[1.5px] transition-all duration-500 ease-expo-out",
                      on ? "rotate-45 border-white bg-white" : "border-current",
                    )}
                  />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <div className="relative overflow-hidden rounded-[28px] bg-petrol-900">
            <Spine
              region={pick?.region ?? "nenhuma"}
              interactive
              onSelect={choose}
              className="h-[460px] w-full md:h-[600px]"
              alt="Mapa do corpo: escultura da coluna com a região escolhida acesa"
            />
            <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-petrol-300">
              {pick ? pick.label : "A região escolhida acende aqui"}
            </p>
          </div>

          <SpotlightCard glow="violet" className="rounded-[28px] bg-petrol-950 p-7 text-bone md:p-9">
            <div ref={result} aria-live="polite" className="relative z-[2] flex h-full flex-col">
              {pick ? (
                <>
                  <p data-q className="text-eyebrow uppercase text-aqua-400">
                    Indicado para você
                  </p>
                  <p data-q className="mt-3 text-h3">{pick.serviceLabel}</p>
                  <div data-q className="mt-6 grid gap-3 text-body text-bone/85">
                    <p>{pick.lines[0]}</p>
                    <p>{pick.lines[1]}</p>
                  </div>
                  <div data-q className="mt-auto pt-10">
                    <Door
                      service={pick.service}
                      section="quiz"
                      detail={pick.region}
                      label={pick.cta}
                      message={pick.message}
                      size="lg"
                    />
                    <p className="mt-3 text-sm text-petrol-300">Abre o WhatsApp com a sua dor já descrita.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-eyebrow uppercase text-petrol-300">Seu resultado</p>
                  <p className="mt-3 text-h3">
                    Escolha uma região para ver o <span className="impact text-violet-300">caminho.</span>
                  </p>
                  <p className="mt-auto pt-10 text-body text-petrol-300">
                    Sem dor nenhuma? Escolha a última opção: performance também é cuidado.
                  </p>
                </>
              )}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
