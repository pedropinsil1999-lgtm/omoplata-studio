"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Logo } from "@/components/brand/Logo";
import { useLenis, scrollToTarget } from "@/components/providers/SmoothScroll";
import { openBooking } from "./Booking";
import { WhatsIcon } from "@/components/ui/Magnetic";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#servicos", label: "Serviços" },
  { href: "#onde-doi", label: "Onde dói?" },
  { href: "#equipe", label: "Equipe" },
  { href: "#contato", label: "Contato" },
];

/** Menu enxuto: esconde ao descer, volta ao subir. Troca de cor sobre seções claras. */
export function Nav() {
  const bar = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [menu, setMenu] = useState(false);

  useGSAP(() => {
    const el = bar.current!;
    const reduced = prefersReducedMotion();
    let hidden = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        el.dataset.scrolled = String(y > 40);
        const hide = self.direction === 1 && y > innerHeight * 0.6;
        if (hide !== hidden) {
          hidden = hide;
          gsap.to(el, { yPercent: hide ? -120 : 0, duration: reduced ? 0 : 0.7, ease: hide ? "power3.inOut" : "expo.out" });
        }
      },
    });
    return () => st.kill();
  });

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMenu(false);
    scrollToTarget(lenis, href, -10);
    history.replaceState(null, "", href);
  };

  return (
    <header
      ref={bar}
      data-scrolled="false"
      className="group/nav fixed inset-x-0 top-0 z-50 px-4 pt-[max(12px,env(safe-area-inset-top))] md:px-6"
    >
      <nav
        aria-label="Principal"
        className={cn(
          "mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 rounded-[22px] pl-4 pr-2 transition-[background-color,color,box-shadow] duration-500",
          "text-bone group-data-[scrolled=true]/nav:bg-petrol-950/70 group-data-[scrolled=true]/nav:shadow-[inset_0_0_0_1px_rgba(143,168,175,.14)] group-data-[scrolled=true]/nav:backdrop-blur-md",
          "[html[data-tone=light]_&]:text-petrol-950 [html[data-tone=light]_&]:group-data-[scrolled=true]/nav:bg-bone/80 [html[data-tone=light]_&]:group-data-[scrolled=true]/nav:shadow-[inset_0_0_0_1px_rgba(15,31,36,.1)]",
        )}
      >
        <a href="#topo" onClick={(e) => go(e, "#topo")} className="text-[15px]" aria-label="OMOPLATA Studio, voltar ao início">
          <Logo />
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="group relative block overflow-hidden rounded-full px-4 py-2 text-[0.95rem] font-medium"
              >
                <span className="block transition-transform duration-500 ease-expo-out group-hover:-translate-y-full">{l.label}</span>
                <span aria-hidden className="absolute inset-x-4 top-2 translate-y-full font-serif text-[1.05em] italic transition-transform duration-500 ease-expo-out group-hover:translate-y-0">
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openBooking("menu")}
            className="inline-flex h-12 items-center gap-2 rounded-[16px] bg-violet-500 px-5 text-[0.95rem] font-semibold text-white transition-colors duration-300 hover:bg-violet-400 hover:text-petrol-950"
            aria-haspopup="dialog"
          >
            <WhatsIcon className="size-4" />
            Agendar
          </button>
          <button
            className="grid size-12 place-items-center rounded-[16px] border border-current/20 md:hidden"
            aria-expanded={menu}
            aria-controls="menu-mobile"
            onClick={() => setMenu((m) => !m)}
          >
            <span className="sr-only">{menu ? "Fechar menu" : "Abrir menu"}</span>
            <span aria-hidden className="relative block h-3 w-5">
              <span className={cn("absolute left-0 top-0 h-[1.8px] w-full bg-current transition-transform duration-500 ease-expo-out", menu && "translate-y-[5px] rotate-45")} />
              <span className={cn("absolute bottom-0 left-0 h-[1.8px] w-full bg-current transition-transform duration-500 ease-expo-out", menu && "-translate-y-[5px] -rotate-45")} />
            </span>
          </button>
        </div>
      </nav>
      <div
        id="menu-mobile"
        hidden={!menu}
        className="mx-auto mt-2 rounded-[22px] bg-petrol-950/95 p-3 text-bone backdrop-blur-md md:hidden"
      >
        <ul className="grid">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={(e) => go(e, l.href)} className="block rounded-xl px-4 py-4 text-2xl font-semibold tracking-[-0.02em]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
