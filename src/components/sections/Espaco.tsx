"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Reveal, Rise } from "@/components/motion/Reveal";
import { Picture } from "@/components/ui/Picture";
import { SITE } from "@/lib/site";

// TODO: trocar pelas fotos reais do Omoplata Hub (painel de madeira com o logo,
// parede azul, bolas suíças, reformers). Manter as proporções de cada moldura.
export function Espaco() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-par]").forEach((el) => {
        const s = Number(el.dataset.par);
        gsap.fromTo(el, { y: s }, { y: -s, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        const img = el.querySelector("img");
        if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: root },
  );

  const a = SITE.address;
  return (
    <section
      ref={root}
      aria-labelledby="espaco-title"
      className="grain relative z-10 bg-bone px-4 py-[clamp(96px,12vw,170px)] text-petrol-950 md:px-8"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="mb-5 flex items-center gap-3 text-eyebrow uppercase text-petrol-700">
              <span aria-hidden className="h-px w-10 bg-wood" />O espaço
            </p>
            <Reveal as="h2" id="espaco-title" className="text-display">
              Omoplata <span className="impact text-violet-500">Hub.</span>
            </Reveal>
          </div>
          <Rise className="md:col-span-4 md:col-start-9">
            <p className="text-lead text-petrol-700">
              Madeira clara, luz natural e espaço para o corpo respirar. O verdadeiro luxo é desacelerar, e aqui ele tem endereço.
            </p>
          </Rise>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-3 md:mt-24 md:gap-6">
          <figure className="col-span-12 md:col-span-7" data-par="30">
            <div className="aspect-[16/11] overflow-hidden rounded-[24px]">
              <Picture name="espaco-reformers-madeira" alt="Sala com reformers de madeira clara e luz natural" sizes="(min-width: 768px) 56vw, 92vw" />
            </div>
          </figure>
          <figure className="col-span-6 md:col-span-4 md:col-start-9 md:mt-32" data-par="-24">
            <div className="aspect-[3/4] overflow-hidden rounded-[24px]">
              <Picture name="espaco-parede-madeira" alt="Parede de madeira com bolas e acessórios de pilates" sizes="(min-width: 768px) 30vw, 46vw" />
            </div>
          </figure>
          <figure className="col-span-6 mt-16 md:col-span-3 md:col-start-2 md:-mt-24" data-par="40">
            <div className="aspect-[4/5] overflow-hidden rounded-[24px]">
              <Picture name="espaco-janelas" alt="Sala ampla com janelas e tapetes" sizes="(min-width: 768px) 22vw, 46vw" />
            </div>
          </figure>
          <figure className="col-span-12 md:col-span-6 md:col-start-6 md:mt-8" data-par="-14">
            <div className="aspect-[16/10] overflow-hidden rounded-[24px]">
              <Picture name="espaco-salao" alt="Salão de pilates com fileira de reformers" sizes="(min-width: 768px) 46vw, 92vw" />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-petrol-950/15 pt-4 text-sm">
              <span className="font-semibold">
                {a.street} · {a.district}
              </span>
              <span className="text-petrol-700">
                {a.city}/{a.state}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
