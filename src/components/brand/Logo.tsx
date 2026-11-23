"use client";

import { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { BG_OUTER, INK_PATH, WORDMARK } from "./logo-paths";

/**
 * Símbolo OMOPLATA: traçado real do arquivo do cliente (rastreado com potrace em
 * scripts/rastrear-logo.cjs), não mais gerado por fórmula. ÚNICO lugar onde o
 * desenho do logo vive: trocar o vetor aqui atualiza preloader, menu, cortina e rodapé.
 */
type SymbolProps = {
  className?: string;
  /** "solid": placa petróleo + marca branca. "line": só a marca, herda currentColor. */
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
      {solid && <path data-logo="bg" d={BG_OUTER} fill="#2E4A54" style={{ transformOrigin: "60px 60px" }} />}
      {/* contorno fino: só visível durante a animação de "desenhar" */}
      <path
        data-logo="outline"
        d={INK_PATH}
        fill="none"
        stroke={solid ? "#fff" : "currentColor"}
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0}
        style={{ transformOrigin: "60px 60px" }}
      />
      {/* marca sólida (traçado real, preenchido) */}
      <path
        data-logo="ink"
        d={INK_PATH}
        fill={solid ? "#fff" : "currentColor"}
        fillRule="evenodd"
        style={{ transformOrigin: "60px 60px" }}
      />
    </svg>
  );
});

/** Timeline de assinatura: o contorno se desenha, a marca preenche, depois respira (1 → 1,03 → 1). */
export function drawSymbol(svg: SVGSVGElement, opts: { speed?: number; breathe?: boolean } = {}) {
  const speed = opts.speed ?? 1;
  const bg = svg.querySelector('[data-logo="bg"]');
  const outline = svg.querySelector<SVGPathElement>('[data-logo="outline"]');
  const ink = svg.querySelector('[data-logo="ink"]');
  const tl = gsap.timeline();
  if (bg) tl.fromTo(bg, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45 / speed, ease: "expo.out" }, 0);
  if (outline) {
    const len = outline.getTotalLength();
    tl.set(outline, { opacity: 1, strokeDasharray: len, strokeDashoffset: len })
      .set(ink, { opacity: 0 })
      .to(outline, { strokeDashoffset: 0, duration: 0.85 / speed, ease: "power3.inOut" }, 0.1 / speed)
      .to(ink, { opacity: 1, duration: 0.3 / speed, ease: "power2.out" }, `-=${0.22 / speed}`)
      .to(outline, { opacity: 0, duration: 0.25 / speed }, "<");
  }
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
