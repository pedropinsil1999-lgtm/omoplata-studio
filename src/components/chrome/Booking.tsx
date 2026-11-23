"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { DOORS, ctaData, wa } from "@/lib/site";
import { WhatsIcon } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";

/** Abre o seletor de agendamento a partir de qualquer lugar */
export const openBooking = (source: string) =>
  window.dispatchEvent(new CustomEvent("omoplata:agendar", { detail: { source } }));

const ICON: Record<keyof typeof DOORS, string> = {
  fisioterapia: "Dor, lesão, reabilitação",
  massoterapia: "Tensão, liberação, relaxamento",
  pilates: "Postura, força, alinhamento",
};

/**
 * Seletor das três portas. Em vez de um "Agendar" que cai num WhatsApp genérico,
 * a pessoa escolhe o serviço: a mensagem chega pronta e o GA4 sabe qual porta converteu.
 * Desktop: painel sob o menu. Mobile: folha que sobe da base.
 */
export function BookingSheet() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("menu");
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      lastFocus.current = document.activeElement as HTMLElement;
      setSource((e as CustomEvent).detail?.source ?? "menu");
      setOpen(true);
    };
    window.addEventListener("omoplata:agendar", onOpen);
    return () => window.removeEventListener("omoplata:agendar", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        // mantém o foco dentro do painel
        const f = panel.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    (window as unknown as { __lenis?: { stop(): void } }).__lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      (window as unknown as { __lenis?: { start(): void } }).__lenis?.start();
      lastFocus.current?.focus?.();
    };
  }, [open]);

  useGSAP(
    () => {
      if (!panel.current) return;
      const d = prefersReducedMotion() ? 0 : 1;
      if (open) {
        gsap.set([panel.current, backdrop.current], { visibility: "visible" });
        gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.5 * d });
        gsap.fromTo(panel.current, { yPercent: 12, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 * d, ease: "expo.out" });
        gsap.fromTo(
          panel.current.querySelectorAll("[data-row]"),
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 * d, stagger: 0.06, ease: "expo.out", delay: 0.08 * d },
        );
      } else {
        gsap.to(panel.current, { opacity: 0, yPercent: 8, duration: 0.35 * d, ease: "power3.inOut" });
        gsap.to(backdrop.current, {
          opacity: 0,
          duration: 0.35 * d,
          onComplete: () => void gsap.set([panel.current, backdrop.current], { visibility: "hidden" }),
        });
      }
    },
    { dependencies: [open] },
  );

  return (
    <>
      <div
        ref={backdrop}
        onClick={() => setOpen(false)}
        className="invisible fixed inset-0 z-[70] bg-petrol-950/60 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className={cn(
          "invisible fixed z-[80] bg-bone text-petrol-950 shadow-[0_40px_120px_-20px_rgba(15,31,36,.6)]",
          "inset-x-0 bottom-0 rounded-t-[28px] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6",
          "md:inset-x-auto md:bottom-auto md:right-6 md:top-20 md:w-[440px] md:rounded-[28px] md:p-7",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4" data-row>
          <div>
            <p className="text-eyebrow uppercase text-petrol-700">Agendar pelo WhatsApp</p>
            <h2 id="booking-title" className="mt-2 text-h3">
              O que você <span className="impact">procura?</span>
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid size-11 shrink-0 place-items-center rounded-[34%] border border-petrol-950/15 transition-colors hover:bg-petrol-950 hover:text-bone"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className="grid gap-2">
          {(Object.keys(DOORS) as (keyof typeof DOORS)[]).map((k) => (
            <li key={k} data-row>
              <a
                href={wa(DOORS[k].message)}
                target="_blank"
                rel="noopener"
                onClick={() => setOpen(false)}
                {...ctaData(`agendar-${source}`, k)}
                className="group flex items-center justify-between gap-4 rounded-[20px] bg-white/70 px-5 py-4 transition-colors duration-300 hover:bg-violet-500 hover:text-white"
              >
                <span>
                  <span className="block text-lg font-semibold tracking-[-0.01em]">{DOORS[k].label}</span>
                  <span className="block text-sm text-petrol-700 transition-colors group-hover:text-white/80">{ICON[k]}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-[34%] bg-petrol-950/5 transition-transform duration-500 ease-expo-out group-hover:rotate-12 group-hover:bg-white/15">
                  <WhatsIcon className="size-[1.05rem]" />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-petrol-700" data-row>
          Não sabe qual escolher? Comece pela avaliação: a gente indica o melhor caminho.
        </p>
      </div>
    </>
  );
}
