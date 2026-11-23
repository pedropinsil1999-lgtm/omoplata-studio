"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { WhatsIcon } from "@/components/ui/Magnetic";
import { openBooking } from "./Booking";

/** Botão flutuante (só mobile), aparece depois da hero e some no CTA final. */
export function FloatingWhatsApp() {
  const ref = useRef<HTMLButtonElement>(null);
  useGSAP(() => {
    const el = ref.current!;
    const d = prefersReducedMotion() ? 0 : 1;
    const show = (on: boolean) =>
      gsap.to(el, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.6, rotate: on ? 0 : -20, duration: 0.6 * d, ease: on ? "back.out(2)" : "power3.inOut" });
    const st = ScrollTrigger.create({
      trigger: "#topo",
      start: "bottom 40%",
      endTrigger: "[data-field=petrol]:not(#topo)",
      end: "top 70%",
      onToggle: (self) => show(self.isActive),
    });
    return () => st.kill();
  });
  return (
    <button
      ref={ref}
      onClick={() => openBooking("flutuante")}
      aria-haspopup="dialog"
      className="invisible fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-40 grid size-16 place-items-center rounded-[36%] bg-violet-500 text-white opacity-0 shadow-[0_18px_40px_-8px_rgba(91,63,224,.7)] md:hidden"
    >
      <WhatsIcon className="size-7" />
      <span className="sr-only">Agendar pelo WhatsApp</span>
    </button>
  );
}
