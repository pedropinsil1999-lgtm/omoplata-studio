"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Reveal, Rise } from "@/components/motion/Reveal";
import { Marquee, SquircleDot } from "@/components/ui/Marquee";
import { Picture } from "@/components/ui/Picture";
import { Door } from "@/components/ui/Magnetic";

const WORDS = ["Performance", "Recuperação", "Prevenção", "Força"];

export function Performance() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-par]").forEach((el) => {
        const speed = Number(el.dataset.par);
        gsap.fromTo(
          el,
          { yPercent: speed * 0.5 },
          { yPercent: -speed * 0.5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="perf-title"
      className="relative z-10 overflow-hidden bg-violet-500 py-[clamp(96px,12vw,170px)] text-white"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7" data-quiet>
          <p className="mb-5 text-eyebrow uppercase text-white/80">Atletas · Beach tennis e outros esportes</p>
          <Reveal as="h2" id="perf-title" className="text-h1">
            Treino forte pede corpo <span className="impact">pronto.</span>
          </Reveal>
        </div>
        <div className="md:col-span-5 md:self-end" data-quiet>
          <Rise>
            <p className="max-w-[40ch] text-lead">
              A gente acompanha quem joga sério: prevenção de lesão, recuperação entre jogos e força para render mais na quadra.
            </p>
          </Rise>
          <Rise className="mt-8">
            <Door
              service="fisioterapia"
              section="performance"
              detail="esportiva"
              variant="violet"
              size="lg"
              label="Agendar avaliação esportiva"
              message="Olá! Vim pelo site e quero agendar uma avaliação de fisioterapia esportiva."
            />
          </Rise>
        </div>
      </div>

      <Marquee className="my-[clamp(56px,8vw,120px)] select-none" speed={70} label="Performance, Recuperação, Prevenção, Força">
        {WORDS.map((w, i) => (
          <Fragment key={w}>
            <span
              className={
                i % 2
                  ? "impact px-[0.25em] text-[clamp(4rem,13vw,13rem)] leading-[1.1] text-white"
                  : "px-[0.25em] text-[clamp(4rem,13vw,13rem)] font-semibold leading-[1.1] tracking-[-0.05em] text-white"
              }
            >
              {w}
            </span>
            <SquircleDot className="text-[clamp(4rem,13vw,13rem)] text-aqua-400" />
          </Fragment>
        ))}
      </Marquee>

      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-3 px-4 md:gap-6 md:px-8">
        <figure className="col-span-7 md:col-span-5" data-par="12">
          <div className="duotone aspect-[3/4] overflow-hidden rounded-[24px]">
            <Picture name="atleta-padel-salto" alt="Atleta saltando para golpear a bola na quadra" sizes="(min-width: 768px) 40vw, 58vw" />
          </div>
        </figure>
        <figure className="col-span-5 mt-24 md:col-span-3 md:mt-40" data-par="-10">
          <div className="duotone aspect-[3/4] overflow-hidden rounded-[24px]">
            <Picture name="atleta-tenis-saque" alt="Tenista no saque em quadra noturna" sizes="(min-width: 768px) 24vw, 40vw" />
          </div>
          <figcaption className="mt-3 text-sm text-white/80">Prevenção de lesão</figcaption>
        </figure>
        <figure className="col-span-12 md:col-span-4 md:-mt-10" data-par="18">
          <div className="duotone aspect-[4/5] overflow-hidden rounded-[24px] md:aspect-[3/4]">
            <Picture name="atleta-padel-quadra" alt="Jogadores em quadra azul ao ar livre" sizes="(min-width: 768px) 32vw, 92vw" />
          </div>
          <figcaption className="mt-3 text-sm text-white/80">Recuperação entre jogos</figcaption>
        </figure>
      </div>
    </section>
  );
}
