import { Hero } from "@/components/sections/Hero";

import { Movimento } from "@/components/sections/Movimento";
import { Manifesto } from "@/components/sections/Manifesto";
import { Servicos } from "@/components/sections/Servicos";
import { Quiz } from "@/components/sections/Quiz";
import { Performance } from "@/components/sections/Performance";
import { Espaco } from "@/components/sections/Espaco";
import { Equipe } from "@/components/sections/Equipe";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Presente } from "@/components/sections/Presente";
import { Contato } from "@/components/sections/Contato";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <main id="conteudo">
        <Hero />
        <div data-bg="#0F1F24" data-tone="dark">
          <div data-bg="#0F1F24" data-tone="dark">
        <Movimento />
      </div>
        </div>
        <div data-bg="#F4F1EC" data-tone="light">
          <div data-bg="#F4F1EC" data-tone="light">
        <Manifesto />
      </div>
        </div>
        <div data-bg="#16292F" data-tone="dark">
          <div data-bg="#16292F" data-tone="dark">
        <Servicos />
      </div>
        </div>
        <div data-bg="#F4F1EC" data-tone="light">
          <div data-bg="#F4F1EC" data-tone="light">
        <Quiz />
      </div>
        </div>
        <div data-bg="#5B3FE0" data-tone="dark" data-field="violet">
          <div data-bg="#5B3FE0" data-tone="dark" data-field="violet">
        <Performance />
      </div>
        </div>
        <div data-bg="#F4F1EC" data-tone="light">
          <div data-bg="#F4F1EC" data-tone="light">
        <Espaco />
      </div>
        </div>
        <div data-bg="#0F1F24" data-tone="dark">
          <div data-bg="#0F1F24" data-tone="dark">
        <Equipe />
      </div>
        </div>
        <div data-bg="#F4F1EC" data-tone="light">
          <div data-bg="#F4F1EC" data-tone="light">
        <Depoimentos />
      </div>
        </div>
        <div data-bg="#5B3FE0" data-tone="dark">
          <div data-bg="#5B3FE0" data-tone="dark">
        <Presente />
      </div>
        </div>
        <div data-bg="#0F1F24" data-tone="dark" data-field="petrol">
          <div data-bg="#0F1F24" data-tone="dark" data-field="petrol">
        <Contato />
      </div>
        </div>
      </main>
      <div data-bg="#0F1F24" data-tone="dark">
        <Footer />
      </div>
    </>
  );
}
