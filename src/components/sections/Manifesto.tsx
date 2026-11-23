"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const TEXT: { w: string; impact?: boolean }[] = [
  ..."A gente trata a dor, devolve o movimento e te ensina a manter isso. Porque o verdadeiro".split(" ").map((w) => ({ w })),
  { w: "luxo", impact: true },
  ..."é desacelerar.".split(" ").map((w) => ({ w })),
];

/** Manifesto: cada palavra acende (0.15 → 1) conforme o scroll. Porte do scroll-fill-headline. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const words = gsap.utils.toArray<HTMLElement>("[data-w]");
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-man]", start: "top 78%", end: "bottom 42%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        "[data-man-mark]",
        { rotate: -30, scale: 0.6, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, ease: "expo.out", duration: 1.2, scrollTrigger: { trigger: "[data-man]", start: "top 80%" } },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Manifesto"
      className="grain relative z-10 bg-bone px-4 py-[clamp(96px,16vw,220px)] text-petrol-950 md:px-8"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-12">
        <div className="md:col-span-2">
          <svg data-man-mark viewBox="0 0 120 120" className="size-14 text-violet-500 md:size-16" aria-hidden>
            {[12, 26, 40, 54].map((a, i) => (
              <rect key={i} x={60 - a} y={60 - a} width={a * 2} height={a * 2} rx={a * 0.42} fill="none" stroke="currentColor" strokeWidth="3" />
            ))}
          </svg>
          <p className="mt-5 text-eyebrow uppercase text-petrol-700">O que a gente acredita</p>
        </div>
        <p data-man className="text-manifesto md:col-span-10">
          {TEXT.map((t, i) => (
            <span key={i}>
              <span data-w className={t.impact ? "impact text-violet-500" : undefined}>
                {t.w}
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
