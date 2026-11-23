"use client";

import { Reveal } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Picture, type ImageName } from "@/components/ui/Picture";

type Pro = { name: string; role: string; specialty: string; crefito: string; quote: string; img: ImageName };

// TODO: confirmar nome, cargo e CREFITO de cada profissional.
// TODO: frases provisórias, validar com cada profissional.
// TODO: trocar as fotos (placeholders em duotone) pelos retratos reais.
const TEAM: Pro[] = [
  {
    name: "Emerson Eduardo",
    role: "Fisioterapeuta", // TODO: confirmar cargo
    specialty: "Fisioterapia esportiva e performance", // TODO: confirmar
    crefito: "CREFITO [número]", // TODO
    quote: "Quem treina precisa de um corpo que aguente o treino.",
    img: "equipe-ombro",
  },
  {
    name: "Camila MB de Souza",
    role: "Fisioterapeuta",
    specialty: "Pilates e reabilitação", // TODO: confirmar
    crefito: "CREFITO [número]", // TODO
    quote: "Postura boa não é rigidez. É o corpo achando o próprio eixo.",
    img: "equipe-antebraco",
  },
  {
    name: "[Nome do profissional]", // TODO: terceiro profissional
    role: "Massoterapeuta", // TODO: confirmar cargo
    specialty: "Massoterapia e liberação miofascial", // TODO: confirmar
    crefito: "[registro]", // TODO
    quote: "Às vezes o melhor tratamento é uma hora sem pressa.",
    img: "equipe-maos",
  },
];

export function Equipe() {
  return (
    <section
      id="equipe"
      aria-labelledby="equipe-title"
      className="relative z-10 bg-petrol-950 px-4 py-[clamp(96px,12vw,170px)] md:px-8"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12">
          <p className="text-eyebrow uppercase text-aqua-400 md:col-span-3">Equipe</p>
          <Reveal as="h2" id="equipe-title" className="text-h1 md:col-span-9">
            Mãos que <span className="impact text-violet-300">entendem</span> de corpo.
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
          {TEAM.map((p, i) => (
            <li key={p.name} className={i === 1 ? "md:mt-20" : i === 2 ? "md:mt-40" : undefined}>
              <SpotlightCard data-cursor="ver" className="group rounded-[28px] bg-petrol-900" tabIndex={0} aria-label={`${p.name}, ${p.role}`}>
                <div className="duotone relative aspect-[4/5] overflow-hidden rounded-t-[28px] [&_img]:transition-transform [&_img]:duration-1000 [&_img]:ease-expo-out group-hover:[&_img]:scale-105 group-hover:[&_img]:[filter:none] group-hover:after:opacity-0 group-focus-visible:[&_img]:[filter:none] group-focus-visible:after:opacity-0">
                  <Picture name={p.img} alt="" sizes="(min-width: 768px) 31vw, 92vw" />
                  {/* especialidade: revelada no hover/foco (sempre visível no toque) */}
                  <div className="absolute inset-x-3 bottom-3 z-[2] translate-y-0 rounded-[18px] bg-petrol-950/85 p-4 backdrop-blur-md transition-transform duration-700 ease-expo-out [@media(hover:hover)]:translate-y-[130%] [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-focus-visible:translate-y-0">
                    <p className="text-eyebrow uppercase text-aqua-400">Especialidade</p>
                    <p className="mt-1.5 text-lg font-semibold">{p.specialty}</p>
                  </div>
                </div>
                <div className="relative z-[2] p-6 md:p-7">
                  <p className="text-h3">{p.name}</p>
                  <p className="mt-1 text-sm text-petrol-300">
                    {p.role} · {p.crefito}
                  </p>
                  <p className="mt-6 border-t border-bone/10 pt-5 text-lead text-bone/90">
                    <span aria-hidden className="impact mr-1 text-violet-300">“</span>
                    {p.quote}
                  </p>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
