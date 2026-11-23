import { notFound } from "next/navigation";
import RenderColuna from "./RenderColuna";

// Rota só de desenvolvimento: gera as imagens estáticas da coluna (scripts/render-coluna.mjs).
// No build de produção vira 404.
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <RenderColuna />;
}
