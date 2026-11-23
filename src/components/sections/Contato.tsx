"use client";

import { Reveal, Rise } from "@/components/motion/Reveal";
import { Door } from "@/components/ui/Magnetic";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE } from "@/lib/site";

// TODO: confirmar todas as respostas com o estúdio antes de publicar.
const FAQ = [
  {
    q: "Atendem convênio?",
    a: "Atendemos particular e emitimos nota/recibo para você pedir reembolso ao seu plano. Fale com a gente no WhatsApp para confirmar o seu caso.", // TODO: confirmar política
  },
  {
    q: "Como funciona a avaliação?",
    a: "É a primeira conversa: a gente entende a sua dor ou objetivo, avalia movimento e postura e te explica o plano, com número de sessões e frequência.", // TODO: confirmar duração e valor
  },
  {
    q: "Nunca fiz pilates. Posso começar?",
    a: "Pode e deve. A aula experimental existe para isso: os exercícios são adaptados ao seu nível desde o primeiro dia.",
  },
  {
    q: "O que vestir?",
    a: "Roupa confortável que permita movimento. Para o pilates, meias antiderrapantes ajudam (e a gente te orienta se você não tiver).", // TODO: confirmar
  },
];

export function Contato() {
  const a = SITE.address;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`;
  return (
    <section
      id="contato"
      aria-labelledby="contato-title"
      className="relative z-10 bg-petrol-950 px-4 pb-16 pt-[clamp(110px,14vw,200px)] md:px-8"
    >
      <div className="mx-auto max-w-[1440px]">
        <div data-quiet className="max-w-[1100px]">
          <p className="mb-5 text-eyebrow uppercase text-aqua-400">Agende</p>
          <Reveal as="h2" id="contato-title" className="text-h1">
            O corpo em <span className="impact text-violet-400">harmonia</span> começa com uma mensagem.
          </Reveal>
        </div>

        <Rise className="mt-12 grid gap-3 md:mt-16 md:grid-cols-3 md:gap-4">
          <Door service="fisioterapia" section="cta-final" size="xl" />
          <Door service="massoterapia" section="cta-final" size="xl" variant="ghost" />
          <Door service="pilates" section="cta-final" size="xl" variant="ghost" />
        </Rise>

        <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5" data-quiet>
            <h3 className="text-h3">Antes de agendar</h3>
            <Accordion type="single" collapsible className="mt-4 text-bone">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="!text-[clamp(1.15rem,1.6vw,1.45rem)] font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="grid gap-4 md:col-span-7 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <div className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-petrol-800">
              <iframe
                title={`Mapa: ${SITE.name} em ${a.city}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 [filter:invert(.92)_hue-rotate(180deg)_saturate(.35)_brightness(.9)_contrast(.95)]"
              />
            </div>
            <div className="flex flex-col gap-6 rounded-[28px] border border-bone/10 bg-petrol-900/90 p-6 md:p-7">
              <div>
                <p className="text-eyebrow uppercase text-petrol-300">Endereço</p>
                <address className="mt-2 not-italic leading-snug">
                  <span className="block font-semibold">Omoplata Hub</span>
                  {a.street}
                  <br />
                  {a.district} · {a.city}/{a.state}
                  <br />
                  CEP {a.zip}
                </address>
                <a
                  className="mt-3 inline-block text-sm text-aqua-400 underline decoration-aqua-400/40 underline-offset-4 hover:decoration-aqua-400"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`}
                  target="_blank"
                  rel="noopener"
                >
                  Abrir no Google Maps
                </a>
              </div>
              <div>
                <p className="text-eyebrow uppercase text-petrol-300">Horário</p>
                <dl className="mt-2 grid gap-1">
                  {SITE.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt>{h.days}</dt>
                      <dd className="tabular-nums text-bone/80">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <p className="text-eyebrow uppercase text-petrol-300">WhatsApp</p>
                <p className="mt-2 font-semibold tabular-nums">{SITE.phoneDisplay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
