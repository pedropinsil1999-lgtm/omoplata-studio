"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Picture } from "@/components/ui/Picture";

/**
 * Do detalhe ao movimento (plano B, sem vídeo).
 * Seção "pinada" com position: sticky (340svh, ~240svh de scroll): começa no close das costas/omoplata,
 * uma máscara em squircle se abre e revela o reformer com zoom-out.
 * O texto acende palavra por palavra sincronizado ao mesmo scroll.
 * TODO: quando houver o vídeo, trocar por sequência de quadros em /public/movimento/.
 */
export function Movimento() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const words = gsap.utils.toArray<HTMLElement>("[data-mv-word]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        // a seção tem 340svh e o palco é sticky: o "pin" é CSS, a altura já vem no HTML
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo("[data-mv-back]", { scale: 1.35 }, { scale: 1.05, duration: 1 }, 0)
        .fromTo("[data-mv-back]", { filter: "brightness(1)" }, { filter: "brightness(.45)", duration: 0.6 }, 0.6)
        // máscara squircle: de uma "janela" pequena até a tela inteira
        .fromTo(
          "[data-mv-mask]",
          {
            // janela em squircle (quadrada, raio em px): começa do tamanho de um detalhe
            clipPath: () => {
              const w = innerWidth;
              const h = innerHeight;
              const s = Math.min(w, h) * 0.24;
              return `inset(${(h - s) / 2}px ${(w - s) / 2}px ${(h - s) / 2}px ${(w - s) / 2}px round ${s * 0.4}px)`;
            },
          },
          { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 1.1, ease: "power2.inOut" },
          0.45,
        )
        .fromTo("[data-mv-front]", { scale: 1.6 }, { scale: 1, duration: 1.3, ease: "power2.out" }, 0.45)
        .fromTo("[data-mv-eyebrow]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25 }, 0.1)
        .fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.08, duration: 0.2 }, 0.9)
        .to({}, { duration: 0.3 });
    },
    { scope: root },
  );

  const phrase = "Seu corpo não foi feito para viver";

  return (
    <section ref={root} aria-labelledby="mv-title" className="relative z-10 h-[340svh] motion-reduce:h-auto">
      <div data-mv-stage className="sticky top-0 h-[100svh] overflow-hidden bg-petrol-950">
        <div data-mv-back className="absolute inset-0 will-change-transform motion-reduce:hidden">
          <Picture
            name="costas-luz"
            alt=""
            sizes="100vw"
            imgClassName="object-[50%_35%]"
          />
        </div>
        <div
          data-mv-mask
          className="absolute inset-0 overflow-hidden will-change-[clip-path] [clip-path:inset(38%_38%_38%_38%_round_40px)] motion-reduce:[clip-path:none]"
        >
          <div data-mv-front className="absolute inset-0 will-change-transform">
            <Picture
              name="reformer-footwork"
              alt="Mulher fazendo exercício de pernas no reformer de pilates"
              sizes="100vw"
              imgClassName="object-[50%_60%]"
            />
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-petrol-950/90 via-petrol-950/30 to-petrol-950/10" />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-12 md:px-8 md:pb-16">
          <div className="mx-auto max-w-[1440px]">
            <p data-mv-eyebrow className="mb-5 text-eyebrow uppercase text-aqua-400">
              Do detalhe ao movimento
            </p>
            <h2 id="mv-title" className="max-w-[14ch] text-h1 text-bone [text-shadow:0_2px_30px_rgba(15,31,36,.5)]">
              {phrase.split(" ").map((w, i) => (
                <span key={i} data-mv-word className="inline-block pr-[0.22em]">
                  {w}
                </span>
              ))}
              <span data-mv-word className="impact inline-block text-violet-300">
                travado.
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
