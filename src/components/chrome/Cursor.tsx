"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Cursor customizado (só mouse): ponto que vira círculo com rótulo
 * sobre [data-cursor="ver"] (cards) e [data-cursor="clique"] (mapa do corpo).
 * O cursor nativo continua sobre links e botões (acessibilidade).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = dot.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const xTo = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.45, ease: "power3.out" });
    let mode = "";
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });
      xTo(e.clientX);
      yTo(e.clientY);
      const t = (e.target as Element)?.closest?.("[data-cursor]") as HTMLElement | null;
      const next = t?.dataset.cursor ?? "";
      if (next !== mode) {
        mode = next;
        label.current!.textContent = next === "ver" ? "Ver" : next === "clique" ? "Clique" : "";
        gsap.to(el, { width: next ? 84 : 10, height: next ? 84 : 10, duration: 0.6, ease: "expo.out" });
        gsap.to(label.current, { opacity: next ? 1 : 0, duration: 0.3 });
      }
    };
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  });
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none invisible fixed left-0 top-0 z-[90] grid size-[10px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[38%] bg-aqua-400 text-petrol-950 opacity-0 mix-blend-normal"
    >
      <span ref={label} className="text-[13px] font-semibold opacity-0" />
    </div>
  );
}
