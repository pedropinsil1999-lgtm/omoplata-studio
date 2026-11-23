"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { SquircleField } from "@/lib/field/squircle-field";

let instance: SquircleField | null = null;
const waiters: ((f: SquircleField) => void)[] = [];
/** Acesso ao campo (ex.: preloader dispara uma onda na saída) */
export function onField(cb: (f: SquircleField) => void) {
  if (instance) cb(instance);
  else waiters.push(cb);
}

/**
 * Canvas único, fixo atrás do conteúdo.
 * - Seções com data-field="petrol|violet" acendem o campo (as outras o apagam).
 * - Seções com data-bg="#hex" levam a cor de fundo da página até elas.
 * - Elementos com data-quiet viram "zonas de leitura" (linhas mais apagadas atrás).
 */
export function FieldLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let field: SquircleField | null = null;
    let disposed = false;
    const triggers: ScrollTrigger[] = [];
    const reduced = prefersReducedMotion();

    // ---- cor de fundo da página por seção ----
    const root = document.documentElement;
    document.querySelectorAll<HTMLElement>("[data-bg]").forEach((sec) => {
      const color = sec.dataset.bg!;
      triggers.push(
        ScrollTrigger.create({
          trigger: sec,
          start: "top 58%",
          end: "bottom 58%",
          onToggle: (self) => {
            if (!self.isActive) return;
            gsap.to(root, { backgroundColor: color, duration: reduced ? 0 : 0.9, ease: "power3.inOut", overwrite: true });
            root.dataset.tone = sec.dataset.tone ?? "dark";
          },
        }),
      );
    });

    // ---- campo: carrega fora do caminho crítico ----
    const boot = async () => {
      const { SquircleField, THEMES } = await import("@/lib/field/squircle-field");
      if (disposed) return;
      const mobile = window.matchMedia("(max-width: 640px)").matches;
      field = new SquircleField(canvas, {
        reducedMotion: reduced,
        cell: mobile ? 132 : 116, // no celular a célula final fica ~92px (0,7x)
        radius: mobile ? 200 : 280,
      });
      instance = field;
      waiters.splice(0).forEach((cb) => cb(field!));
      field.setQuietZones([...document.querySelectorAll("[data-quiet]")]);
      field.setScroll(window.scrollY);
      const onScroll = () => field?.setScroll(window.scrollY);
      window.addEventListener("scroll", onScroll, { passive: true });

      const sections = [...document.querySelectorAll<HTMLElement>("[data-field]")];
      const activeSet = new Set<HTMLElement>();
      const apply = () => {
        const on = activeSet.size > 0;
        const top = [...activeSet].pop();
        gsap.to(canvas, { opacity: on ? 0.55 : 0, duration: reduced ? 0 : 0.8, ease: "power3.inOut", overwrite: true });
        if (top) field?.setTheme(top.dataset.field === "violet" ? THEMES.violet : THEMES.petrol);
        field?.setActive(on);
      };
      sections.forEach((sec) =>
        triggers.push(
          ScrollTrigger.create({
            trigger: sec,
            start: "top 70%",
            end: "bottom 30%",
            onToggle: (self) => {
              if (self.isActive) activeSet.add(sec);
              else activeSet.delete(sec);
              apply();
            },
          }),
        ),
      );
      // estado inicial (a hero já está na tela)
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3) activeSet.add(s);
      });
      apply();
      field.start();
      cleanupScroll = () => window.removeEventListener("scroll", onScroll);
    };
    let cleanupScroll = () => {};
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    // liga depois do preloader (não disputa a thread com a primeira pintura)
    let id = 0;
    const schedule = () => (id = ric ? ric(boot, { timeout: 900 }) : window.setTimeout(boot, 200));
    if (document.documentElement.dataset.intro === "done") schedule();
    else window.addEventListener("omoplata:intro", schedule, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("omoplata:intro", schedule);
      if (!ric) clearTimeout(id);
      triggers.forEach((t) => t.kill());
      cleanupScroll();
      field?.destroy();
      instance = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-[100lvh] w-full opacity-0"
    />
  );
}
