"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span" | "blockquote";

type RevealProps = {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
  /** atraso em segundos */
  delay?: number;
  /** "scroll": entra quando aparece. "manual": espera o evento omoplata:intro (hero). */
  trigger?: "scroll" | "manual";
  stagger?: number;
} & Omit<React.HTMLAttributes<HTMLElement>, "children">;

/**
 * Título com reveal por linha mascarada (SplitText + overflow hidden).
 * Porte do "text reveal" do 21st.dev para GSAP. Nunca um fade genérico.
 * Sem JS ou com movimento reduzido, o texto aparece normal.
 */
export function Reveal({
  as: Tag = "div",
  className,
  children,
  delay = 0,
  trigger = "scroll",
  stagger = 0.09,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      let split: SplitText | null = null;
      let played = false;
      const run = () => {
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "ln",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });
            if (played) return; // re-split por resize: não reanima
            const tween = gsap.from(self.lines, {
              yPercent: 115,
              rotate: 2.5,
              transformOrigin: "0% 100%",
              duration: 1.15,
              ease: "expo.out",
              stagger,
              delay,
              paused: trigger === "manual",
              onStart: () => void (played = true),
            });
            if (trigger === "manual") {
              const go = () => tween.play();
              if (document.documentElement.dataset.intro === "done") go();
              else window.addEventListener("omoplata:intro", go, { once: true });
            }
            return tween;
          },
        });
      };
      // Hero: prepara já (fica sob o preloader). Resto: só quando chega a 88% da tela,
      // assim o carregamento não mede e quebra dezenas de títulos de uma vez.
      let io: IntersectionObserver | null = null;
      if (trigger === "manual") run();
      else {
        io = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            io?.disconnect();
            run();
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
        io.observe(el);
      }
      return () => {
        io?.disconnect();
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    // @ts-expect-error: ref genérico para a tag escolhida
    <Tag ref={ref} data-reveal={trigger === "manual" ? "hero" : ""} className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Bloco que sobe com leve atraso (para parágrafos/CTAs que acompanham um título) */
export function Rise({
  children,
  className,
  delay = 0.15,
  trigger = "scroll",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  trigger?: "scroll" | "manual";
  as?: "div" | "p" | "ul";
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (prefersReducedMotion()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      const tween = gsap.fromTo(el, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", delay, paused: true });
      if (trigger === "manual") {
        const go = () => tween.play();
        if (document.documentElement.dataset.intro === "done") go();
        else window.addEventListener("omoplata:intro", go, { once: true });
        return;
      }
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          tween.play();
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
      return () => io.disconnect();
    },
    { scope: ref },
  );

  return (
    // @ts-expect-error: ref genérico
    <Tag ref={ref} data-reveal={trigger === "manual" ? "hero" : ""} className={className}>
      {children}
    </Tag>
  );
}
