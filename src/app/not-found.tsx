import { TransitionLink } from "@/components/chrome/PageTransition";

export default function NotFound() {
  return (
    <main id="conteudo" className="relative z-10 grid min-h-[100svh] place-items-center px-4 text-center" data-field="petrol">
      <div>
        <p className="text-eyebrow uppercase text-aqua-400">Erro 404</p>
        <h1 className="mt-4 text-h1">
          Essa página saiu do <span className="impact text-violet-400">eixo.</span>
        </h1>
        <TransitionLink
          href="/"
          className="mt-10 inline-flex h-14 items-center rounded-pill bg-violet-500 px-7 font-semibold text-white transition-colors hover:bg-violet-400 hover:text-petrol-950"
        >
          Voltar ao início
        </TransitionLink>
      </div>
    </main>
  );
}
