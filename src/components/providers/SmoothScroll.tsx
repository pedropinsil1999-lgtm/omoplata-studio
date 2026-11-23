"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Rola até um alvo usando Lenis quando existe (scroll suave) ou o nativo. */
export function scrollToTarget(lenis: Lenis | null, target: string | HTMLElement, offset = 0) {
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Sem Lenis com movimento reduzido ou no toque (a rolagem nativa do celular já é a melhor)
    if (prefersReducedMotion() || matchMedia("(pointer: coarse)").matches) return;
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, anchors: false });
    // Lenis -> ScrollTrigger, e um único relógio (o ticker do GSAP) para os dois
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    (window as unknown as { __lenis?: Lenis }).__lenis = l;
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
