"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Region } from "./SpineScene";
import { cn } from "@/lib/utils";

export type { Region };

const SpineScene = dynamic(() => import("./SpineScene"), { ssr: false });

export const REGIONS: Region[] = ["nenhuma", "pescoco", "ombros", "lombar", "coluna", "performance"];

function canUse3D() {
  if (typeof window === "undefined") return false;
  if (!matchMedia("(min-width: 900px)").matches) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * A escultura da coluna.
 * Desktop: 3D ao vivo (React Three Fiber), carregado só quando chega perto da tela.
 * Celular / movimento reduzido / sem WebGL: imagens da mesma escultura,
 * pré-renderizadas por scripts/render-coluna.mjs (uma por região), com crossfade.
 */
export function Spine({
  region,
  onSelect,
  interactive,
  className,
  forceStatic,
  alt = "Escultura de porcelana da coluna com as omoplatas",
}: {
  region: Region;
  onSelect?: (r: Region) => void;
  interactive?: boolean;
  className?: string;
  forceStatic?: boolean;
  alt?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"static" | "3d">("static");
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (forceStatic || !canUse3D()) return;
    setMode("3d");
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "60% 0px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [forceStatic]);

  return (
    <div ref={ref} className={cn("relative", className)} role="img" aria-label={alt}>
      {mode === "static" || !near ? (
        REGIONS.map((r) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={r}
            src={`/coluna/${r}.webp`}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            width={800}
            height={1000}
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-expo-out",
              r === region ? "opacity-100" : "opacity-0",
            )}
          />
        ))
      ) : (
        <SpineScene region={region} onSelect={onSelect} interactive={interactive} className="absolute inset-0" />
      )}
    </div>
  );
}
