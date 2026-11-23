"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Region } from "@/components/spine/SpineScene";

const SpineScene = dynamic(() => import("@/components/spine/SpineScene"), { ssr: false });

export default function RenderColuna() {
  const [region, setRegion] = useState<Region>("nenhuma");
  const [clear, setClear] = useState(false);
  useEffect(() => {
    const r = new URLSearchParams(location.search).get("r") as Region | null;
    if (r) setRegion(r);
    if (new URLSearchParams(location.search).get("bg") === "none") {
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
      setClear(true);
    }
    document.documentElement.dataset.intro = "skip";
    document.getElementById("preloader")?.remove();
  }, []);
  return (
    <>
    {/* só a escultura na captura: esconde menu, campo, cursor e botão flutuante */}
    <style>{`header, canvas.fixed, button.fixed, #curtain, [aria-hidden].fixed { display: none !important; }`}</style>
    <div className={clear ? "fixed inset-0 z-[300]" : "fixed inset-0 z-[300] bg-[#16292f]"}>
      <SpineScene region={region} className="h-full w-full" />
    </div>
    </>
  );
}
