"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { LogoSymbol, drawSymbol } from "@/components/brand/Logo";

/**
 * Cortina entre páginas (máx. 0,8 s): sobe em petróleo, o símbolo se desenha
 * no centro, a nova rota carrega por baixo e a cortina sai pelo topo.
 */
export function Curtain() {
  const root = useRef<HTMLDivElement>(null);
  const sym = useRef<SVGSVGElement>(null);
  const pathname = usePathname();

  // saída da cortina quando a nova rota monta
  useGSAP(
    () => {
      const el = root.current!;
      if (el.dataset.state !== "in") return;
      gsap.to(el, {
        yPercent: -100,
        duration: prefersReducedMotion() ? 0 : 0.4,
        ease: "power3.inOut",
        delay: 0.05,
        onComplete: () => {
          el.dataset.state = "idle";
          gsap.set(el, { visibility: "hidden" });
        },
      });
    },
    { dependencies: [pathname] },
  );

  return (
    <div
      ref={root}
      id="curtain"
      data-state="idle"
      aria-hidden
      className="invisible fixed inset-0 z-[95] grid place-items-center bg-petrol-950"
    >
      <LogoSymbol ref={sym} variant="line" className="size-20 text-bone" />
    </div>
  );
}

/** Link interno com a cortina. Use para navegar entre páginas (não para âncoras). */
export function TransitionLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        const el = document.getElementById("curtain");
        const sym = el?.querySelector("svg") as SVGSVGElement | null;
        if (!el || !sym || prefersReducedMotion()) return router.push(href);
        el.dataset.state = "in";
        gsap.set(el, { visibility: "visible", yPercent: 100 });
        gsap
          .timeline({ onComplete: () => router.push(href) })
          .to(el, { yPercent: 0, duration: 0.35, ease: "power3.inOut" })
          .add(drawSymbol(sym, { speed: 2.6, breathe: false }), 0.15);
      }}
    >
      {children}
    </a>
  );
}
