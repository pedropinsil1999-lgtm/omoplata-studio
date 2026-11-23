"use client";

import { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SYMBOL_LAYERS, SYMBOL_OUTER, WORDMARK } from "./logo-paths";

/**
 * Símbolo OMOPLATA. ÚNICO lugar onde o desenho do logo vive:
 * trocar o vetor aqui atualiza preloader, menu, cortina e rodapé.
 */
type SymbolProps = {
  className?: string;
  /** "solid": base petróleo + linhas brancas. "line": só traço, herda currentColor. */
  variant?: "solid" | "line";
  title?: string;
};

export const LogoSymbol = forwardRef<SVGSVGElement, SymbolProps>(function LogoSymbol(
  { className, variant = "solid", title },
  ref,
) {
  const solid = variant === "solid";
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      className={cn("overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        data-logo="base"
        d={SYMBOL_OUTER}
        fill={solid ? "#2E4A54" : "none"}
        stroke={solid ? "none" : "currentColor"}
        strokeWidth={solid ? 0 : 2}
        style={{ transformOrigin: "60px 60px" }}
      />
      {SYMBOL_LAYERS.map((d, i) => (
        <path
          key={i}
          data-logo="layer"
          d={d}
          fill="none"
          stroke={solid ? "#fff" : "currentColor"}
          strokeWidth={3.4}
          strokeLinejoin="round"
          pathLength={1}
          style={{ transformOrigin: "60px 60px" }}
        />
      ))}
    </svg>
  );
});

/** Timeline de assinatura: camadas de dentro para fora, depois respira (1 → 1,03 → 1). */
export function drawSymbol(svg: SVGSVGElement, opts: { speed?: number; breathe?: boolean } = {}) {
  const speed = opts.speed ?? 1;
  const base = svg.querySelector('[data-logo="base"]');
  const layers = svg.querySelectorAll('[data-logo="layer"]');
  const tl = gsap.timeline();
  tl.set(layers, { strokeDasharray: 1, strokeDashoffset: 1 })
    .fromTo(base, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 / speed, ease: "expo.out" }, 0)
    .to(layers, { strokeDashoffset: 0, duration: 0.5 / speed, ease: "power3.inOut", stagger: 0.12 / speed }, 0.12 / speed);
  if (opts.breathe !== false)
    tl.to(svg, { scale: 1.03, duration: 0.35 / speed, ease: "power3.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 50%" });
  return tl;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 -${WORDMARK.cap + 1} ${WORDMARK.width} ${WORDMARK.cap + 2}`} className={className} aria-hidden>
      <path d={WORDMARK.d} fill="currentColor" />
    </svg>
  );
}

/** Lockup horizontal (símbolo + OMOPLATA). `animate` desenha ao montar. */
export function Logo({ className, animate = false }: { className?: string; animate?: boolean }) {
  const sym = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    if (animate && sym.current && !prefersReducedMotion()) drawSymbol(sym.current, { speed: 1.4 });
  }, [animate]);
  return (
    <span className={cn("inline-flex items-center gap-[0.55em]", className)}>
      <LogoSymbol ref={sym} className="h-[1.9em] w-auto" />
      <Wordmark className="h-[0.62em] w-auto" />
      <span className="sr-only">OMOPLATA Studio</span>
    </span>
  );
}
