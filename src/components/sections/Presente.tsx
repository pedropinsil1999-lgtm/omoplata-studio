"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Reveal, Rise } from "@/components/motion/Reveal";
import { Picture } from "@/components/ui/Picture";
import { Magnetic, WhatsIcon } from "@/components/ui/Magnetic";
import { LogoSymbol, Wordmark } from "@/components/brand/Logo";
import { GIFT_MESSAGE, ctaData, wa } from "@/lib/site";

export function Presente() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-gift-photo]",
        { clipPath: "inset(18% 18% 18% 18% round 40%)", rotate: -4 },
        {
          clipPath: "inset(0% 0% 0% 0% round 32px)",
          rotate: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-gift-photo]", start: "top 90%", end: "center 55%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        "[data-voucher]",
        { y: 120, rotate: 9 },
        { y: -40, rotate: -6, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="presente-title"
      className="relative z-10 overflow-hidden bg-violet-500 px-4 py-[clamp(96px,12vw,170px)] text-white md:px-8"
    >
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-12 md:items-center md:gap-8">
        <div className="md:col-span-6">
          <p className="mb-5 text-eyebrow uppercase text-white/80">Presenteie</p>
          <Reveal as="h2" id="presente-title" className="text-h1">
            Dê de presente uma <span className="impact">pausa.</span>
          </Reveal>
          <Rise className="mt-8 max-w-[38ch]">
            <p className="text-lead">
              Normalize presentear pessoas especiais com uma experiência como essa. Uma sessão de massagem, um cartão com o nome de quem você ama.
            </p>
          </Rise>
          <Rise className="mt-10">
            <Magnetic>
              <a
                href={wa(GIFT_MESSAGE)}
                target="_blank"
                rel="noopener"
                {...ctaData("presente", "presente")}
                className="group inline-flex h-16 items-center gap-4 rounded-pill bg-bone px-7 font-semibold text-petrol-950 transition-colors duration-500 hover:bg-white"
              >
                <span data-magnetic-inner>Quero dar de presente</span>
                <span className="grid size-8 place-items-center rounded-[34%] bg-violet-500 text-white transition-transform duration-500 ease-expo-out group-hover:rotate-12">
                  <WhatsIcon className="size-[1.05rem]" />
                </span>
                <span className="sr-only"> (abre o WhatsApp)</span>
              </a>
            </Magnetic>
          </Rise>
        </div>

        <div className="relative md:col-span-5 md:col-start-8">
          <div data-gift-photo className="aspect-[4/5] overflow-hidden rounded-[32px]">
            <Picture name="presente-massagem" alt="Sessão de massagem relaxante nas costas" sizes="(min-width: 768px) 38vw, 92vw" />
          </div>
          {/* vale-presente */}
          <div
            data-voucher
            aria-hidden
            className="absolute -bottom-10 -left-4 w-[min(78%,330px)] rotate-[-6deg] rounded-[22px] bg-bone p-5 text-petrol-950 shadow-[0_30px_60px_-20px_rgba(15,31,36,.55)] md:-left-16"
          >
            <div className="flex items-center justify-between">
              <LogoSymbol className="size-10" />
              <span className="text-eyebrow uppercase text-petrol-700">Vale-presente</span>
            </div>
            <p className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.02em]">
              Uma sessão de <span className="impact text-violet-500">massagem</span>
            </p>
            <div className="mt-5 flex items-end justify-between border-t border-dashed border-petrol-950/25 pt-3">
              <span className="text-sm text-petrol-700">Para: alguém especial</span>
              <Wordmark className="h-2.5 w-auto text-petrol-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
