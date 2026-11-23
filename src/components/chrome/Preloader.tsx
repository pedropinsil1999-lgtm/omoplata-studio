"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { LogoSymbol, drawSymbol } from "@/components/brand/Logo";
import { onField } from "@/components/field/FieldLayer";

const KEY = "omoplata:intro";

function finish() {
  document.documentElement.dataset.intro = "done";
  document.documentElement.style.overflow = "";
  window.dispatchEvent(new Event("omoplata:intro"));
}

/**
 * Preloader (máx. 1,4 s, só na primeira visita da sessão).
 * O logo se desenha; na saída as camadas se expandem até cobrir a tela
 * e o campo interativo recebe uma onda do centro: o símbolo "vira" o fundo.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const sym = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    (window as unknown as { __omoReady?: boolean }).__omoReady = true;
    const el = root.current!;
    const html = document.documentElement;
    if (html.dataset.intro === "skip") {
      el.remove();
      finish();
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    if (prefersReducedMotion()) {
      gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.2, onComplete: () => (el.remove(), finish()) });
      return;
    }
    html.style.overflow = "hidden";
    const bg = sym.current!.querySelector('[data-logo="bg"]');
    const ink = sym.current!.querySelector('[data-logo="ink"]');
    const tl = gsap.timeline({ onComplete: () => el.remove() });
    tl.add(drawSymbol(sym.current!, { speed: 1.55, breathe: false }))
      // respira uma vez
      .to(sym.current, { scale: 1.03, duration: 0.18, ease: "power3.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 50%" })
      // saída: a marca se expande até cobrir a tela e o símbolo "vira" o fundo
      .addLabel("out")
      .to(bg, { opacity: 0, duration: 0.3, ease: "power3.inOut" }, "out")
      .to(ink, { scale: 22, opacity: 0, duration: 0.6, ease: "expo.in" }, "out")
      .to(el, { backgroundColor: "rgba(15,31,36,0)", duration: 0.4, ease: "power3.inOut" }, "out+=0.18")
      .add(() => {
        onField((f) => f.pulse(innerWidth / 2, innerHeight / 2));
        finish();
      }, "out+=0.3");
  });

  return (
    <div
      ref={root}
      id="preloader"
      aria-hidden
      className="fixed inset-0 z-[100] grid place-items-center bg-petrol-950"
    >
      <LogoSymbol ref={sym} className="size-24 md:size-28" />
    </div>
  );
}

/** Script inline no <head>: decide antes da primeira pintura se o preloader aparece. */
export const preloaderScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('${KEY}'))d.dataset.intro='skip'}catch(e){}setTimeout(function(){if(!window.__omoReady)d.classList.add('reveal-all')},6000)})();`;
