"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Marquee infinito (estrutura do Marquee do Dice UI, motor em GSAP).
 * - Conteúdo duplicado com aria-hidden: o leitor de tela lê uma vez só.
 * - Velocidade acelera com a velocidade do scroll e volta suave.
 * - Pausa no hover (desacelera, não corta).
 * - Movimento reduzido: vira uma linha estática com quebra.
 */
export function Marquee({
  children,
  className,
  speed = 60, // px/s
  reverse = false,
  pauseOnHover = true,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  label?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const t = track.current!;
      const half = t.scrollWidth / 2;
      gsap.set(t, { x: reverse ? -half : 0 });
      const tween = gsap.to(t, {
        x: reverse ? 0 : -half,
        duration: half / speed,
        ease: "none",
        repeat: -1,
        paused: true, // só anda quando está na tela
      });
      let hover = 0;
      let boost = 1;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);
        },
        onToggle: (self) => void (self.isActive ? tween.resume() : tween.pause()),
      });
      if (st.isActive) tween.resume();
      const tick = () => {
        if (!st.isActive) return;
        boost += (1 - boost) * 0.06;
        const target = (1 - hover) * boost;
        tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.12));
      };
      gsap.ticker.add(tick);
      const on = () => (hover = pauseOnHover ? 1 : 0);
      const off = () => (hover = 0);
      root.current!.addEventListener("pointerenter", on);
      root.current!.addEventListener("pointerleave", off);
      return () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative overflow-hidden motion-reduce:overflow-visible", className)} role="marquee" aria-label={label}>
      <div ref={track} className="flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
        <div className="flex shrink-0 items-center motion-reduce:flex-wrap motion-reduce:justify-center">{children}</div>
        <div className="flex shrink-0 items-center motion-reduce:hidden" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Separador com o squircle do logo */
export function SquircleDot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("size-[0.42em] shrink-0", className)} aria-hidden>
      <rect x="1.5" y="1.5" width="17" height="17" rx="6.4" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="7" y="7" width="6" height="6" rx="2.2" fill="currentColor" />
    </svg>
  );
}
