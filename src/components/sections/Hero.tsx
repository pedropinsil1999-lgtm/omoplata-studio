"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Rise } from "@/components/motion/Reveal";
import { Door } from "@/components/ui/Magnetic";
import { SITE } from "@/lib/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.set("[data-reveal=hero]", { visibility: "visible" });
      if (prefersReducedMotion()) return;
      // entrada da headline: linha por linha, depois do preloader
      const intro = gsap.from("[data-hero-line]", {
        yPercent: 115,
        rotate: 2.5,
        transformOrigin: "0% 100%",
        duration: 1.15,
        ease: "expo.out",
        stagger: 0.12,
        paused: true,
      });
      const lead = gsap.from("[data-hero-lead]", { y: 28, duration: 1.1, ease: "expo.out", delay: 0.45, paused: true });
      const go = () => (intro.play(), lead.play());
      if (document.documentElement.dataset.intro === "done") go();
      else window.addEventListener("omoplata:intro", go, { once: true });
      // No scroll a headline sobe com parallax (o campo gira sozinho via setScroll)
      gsap.to("[data-hero-title]", {
        yPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-fade]", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "30% top", end: "80% top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="topo"
      ref={root}
      data-field="petrol"
      data-bg="#0F1F24"
      data-tone="dark"
      className="relative z-10 flex min-h-[100svh] flex-col justify-end px-4 pb-8 pt-28 md:px-8 md:pb-10"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 text-eyebrow uppercase text-petrol-300 md:mb-10" data-hero-fade>
          <p>Fisioterapia · Massoterapia · Pilates</p>
          <p>Resende/RJ · Omoplata Hub</p>
        </div>

        <div data-hero-title data-quiet className="relative">
          {/* Máscaras já no HTML (sem SplitText aqui): as linhas existem desde a 1ª pintura,
              o que mantém o LCP cedo; o GSAP só desliza cada linha para dentro da máscara. */}
          <h1 className="text-display" data-reveal="hero">
            {["Performance.", "Reequilíbrio.", "Bem-estar."].map((w, i) => (
              <span key={w} className="ln-mask block overflow-hidden">
                <span data-hero-line className={i === 2 ? "impact block text-violet-400" : "block"}>
                  {w}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end" data-hero-fade>
          <div className="md:col-span-7" data-quiet>
            {/* sem Rise: é o elemento de LCP, então fica visível desde a 1ª pintura */}
            <div>
              <p data-hero-lead className="max-w-[38ch] text-lead text-pretty text-bone">
                Fisioterapia, massoterapia e pilates em Resende. O corpo em <span className="impact">harmonia.</span>
              </p>
            </div>
            <Rise trigger="manual" delay={0.7} className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Door service="fisioterapia" section="hero" />
              <Door service="massoterapia" section="hero" variant="ghost" />
              <Door service="pilates" section="hero" variant="ghost" />
            </Rise>
          </div>
          <Rise trigger="manual" delay={0.85} className="md:col-span-5 md:justify-self-end">
            <a
              href="#depoimentos"
              className="group inline-flex items-center gap-4 rounded-[20px] border border-bone/15 bg-petrol-950/80 py-3 pl-3 pr-5 transition-colors hover:border-aqua-400/50"
            >
              <span className="grid size-12 place-items-center rounded-[34%] bg-aqua-400 text-lg text-petrol-950" aria-hidden>
                ★
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-semibold tabular-nums">
                  5,0 no Google
                </span>
                <span className="block text-sm text-petrol-300">{SITE.rating.count} avaliações</span>
              </span>
            </a>
          </Rise>
        </div>
      </div>
    </section>
  );
}
