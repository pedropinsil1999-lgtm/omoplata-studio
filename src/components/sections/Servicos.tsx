"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Reveal, Rise } from "@/components/motion/Reveal";
import { Door } from "@/components/ui/Magnetic";
import { Picture, type ImageName } from "@/components/ui/Picture";
import { Spine, type Region } from "@/components/spine/Spine";

type Block = {
  id: "fisioterapia" | "massoterapia" | "pilates";
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  bullets: string[];
  region: Region;
  regionLabel: string;
  img: ImageName;
  alt: string;
};

const BLOCKS: Block[] = [
  {
    id: "fisioterapia",
    eyebrow: "Fisioterapia",
    title: (
      <>
        Fisio que te devolve o <span className="impact text-violet-300">movimento.</span>
      </>
    ),
    lead: "Sempre muito travada? A gente investiga a causa, trata a dor e monta um plano para ela não voltar.",
    bullets: ["Dor nas costas, no joelho, no ombro", "Lesão e reabilitação", "Fisioterapia esportiva"],
    region: "lombar",
    regionLabel: "Lombar",
    img: "fisio-alongamento",
    alt: "Fisioterapeuta ajustando o alongamento de um paciente",
  },
  {
    id: "massoterapia",
    eyebrow: "Massoterapia",
    title: (
      <>
        Solta o que o dia <span className="impact text-violet-300">travou.</span>
      </>
    ),
    lead: "Seu pescoço vive tenso? Massagem terapêutica e liberação para tirar o peso dos ombros.",
    bullets: ["Tensão no pescoço e nos ombros", "Liberação miofascial", "Relaxamento e recuperação"],
    region: "ombros",
    regionLabel: "Ombros e omoplatas",
    img: "massagem-costas",
    alt: "Mãos fazendo massagem nas costas e omoplatas",
  },
  {
    id: "pilates",
    eyebrow: "Pilates",
    title: (
      <>
        Força que <span className="impact text-violet-300">alinha.</span>
      </>
    ),
    lead: "Postura, força e consciência do corpo no reformer, no seu ritmo. Do primeiro treino ao avançado.",
    bullets: ["Postura e alinhamento", "Força de core e mobilidade", "Aulas no reformer"],
    region: "coluna",
    regionLabel: "Coluna inteira",
    img: "pilates-estudio-vertical",
    alt: "Estúdio de pilates com reformers de madeira",
  },
];

export function Servicos() {
  const root = useRef<HTMLElement>(null);
  const [region, setRegion] = useState<Region>("nenhuma");
  const [active, setActive] = useState(-1);

  useGSAP(
    () => {
      const blocks = gsap.utils.toArray<HTMLElement>("[data-svc]");
      blocks.forEach((b, i) =>
        ScrollTrigger.create({
          trigger: b,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) {
              setRegion(BLOCKS[i].region);
              setActive(i);
            }
          },
        }),
      );
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 55%",
        end: "bottom 45%",
        onLeave: () => setRegion("nenhuma"),
        onLeaveBack: () => (setRegion("nenhuma"), setActive(-1)),
      });

      if (prefersReducedMotion()) return;
      // fotos: revelam com clip-path e desinflam
      blocks.forEach((b) => {
        const frame = b.querySelector("[data-svc-photo]");
        const img = b.querySelector("[data-svc-photo] img");
        gsap.fromTo(
          frame,
          { clipPath: "inset(100% 0% 0% 0% round 24px)" },
          { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: frame, start: "top 85%", once: true } },
        );
        gsap.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: frame, start: "top 85%", once: true } });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="servicos"
      ref={root}
      aria-labelledby="servicos-title"
      className="relative z-10 bg-petrol-900 px-4 pt-[clamp(96px,12vw,180px)] md:px-8"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12">
          <p className="text-eyebrow uppercase text-aqua-400 md:col-span-3">Serviços</p>
          <Reveal as="h2" id="servicos-title" className="text-h1 md:col-span-9">
            Três caminhos, <span className="impact text-violet-300">um</span> corpo.
          </Reveal>
        </div>

        <div className="mt-16 grid md:mt-24 md:grid-cols-12 md:gap-8">
          {/* escultura fixa (desktop) */}
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-0 flex h-[100svh] flex-col justify-center">
              <Spine region={region} className="h-[78svh] w-full" />
              <div className="mt-4 flex items-center justify-between text-sm text-petrol-300" aria-live="polite">
                <span className="tabular-nums">
                  {active >= 0 ? `${active + 1} / 3` : "Role para ver"}
                </span>
                <span className="text-bone">{active >= 0 ? BLOCKS[active].regionLabel : "Coluna e omoplatas"}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            {BLOCKS.map((b) => (
              <article
                key={b.id}
                data-svc
                aria-labelledby={`svc-${b.id}`}
                className="flex min-h-[auto] flex-col justify-center border-t border-bone/10 py-16 md:min-h-[105svh] md:py-24"
              >
                {/* mobile: a escultura vira um elemento menor no topo do bloco */}
                <Spine region={b.region} forceStatic className="mx-auto mb-6 h-[42svh] w-full max-w-[360px] md:hidden" />
                <p className="mb-5 text-eyebrow uppercase text-petrol-300">{b.eyebrow}</p>
                <Reveal as="h3" id={`svc-${b.id}`} className="text-h1">
                  {b.title}
                </Reveal>
                <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end">
                  <div>
                    <Rise>
                      <p className="max-w-[38ch] text-lead text-bone">{b.lead}</p>
                    </Rise>
                    <Rise as="ul" className="mt-7 grid gap-3">
                      {b.bullets.map((t) => (
                        <li key={t} className="flex items-center gap-3 border-b border-bone/10 pb-3 text-body">
                          <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-aqua-400" aria-hidden>
                            <rect x="1" y="1" width="10" height="10" rx="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                          {t}
                        </li>
                      ))}
                    </Rise>
                    <Rise className="mt-9">
                      <Door service={b.id} section="servicos" size="lg" />
                    </Rise>
                  </div>
                  <div data-svc-photo className="aspect-[4/5] overflow-hidden rounded-[24px]">
                    <Picture name={b.img} alt={b.alt} sizes="(min-width: 1024px) 26vw, (min-width: 768px) 50vw, 92vw" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
