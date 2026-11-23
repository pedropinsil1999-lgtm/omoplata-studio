"use client";

import { useRef } from "react";
import { gsap, useGSAP, isTouch } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Card com spotlight (porte do Spotlight Card do 21st.dev).
 * O brilho é um squircle água-marinha/violeta que segue o cursor com atraso,
 * em vez do círculo padrão.
 */
export function SpotlightCard({
  children,
  className,
  glow = "aqua",
  ...rest
}: { children: React.ReactNode; className?: string; glow?: "aqua" | "violet" } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (isTouch()) return;
      const el = ref.current!;
      const s = spot.current!;
      const xTo = gsap.quickTo(s, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(s, "y", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
      };
      const enter = () => gsap.to(s, { opacity: 1, scale: 1, rotate: 12, duration: 0.6, ease: "expo.out" });
      const leave = () => gsap.to(s, { opacity: 0, scale: 0.6, rotate: 0, duration: 0.6, ease: "expo.out" });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn("relative isolate overflow-hidden", className)} {...rest}>
      <div
        ref={spot}
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-[1] -ml-[160px] -mt-[160px] size-[320px] scale-50 rounded-[36%] opacity-0 mix-blend-screen blur-3xl",
          glow === "aqua" ? "bg-aqua-400/30" : "bg-violet-400/40",
        )}
      />
      {children}
    </div>
  );
}
