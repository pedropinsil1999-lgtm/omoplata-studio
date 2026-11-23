# O que o cliente precisa enviar ou confirmar

Tudo está marcado no código com `// TODO`. A maior parte dos dados fica em `src/lib/site.ts`.

## Marca
- [ ] **Arquivo do logo original** (qualquer qualidade). O símbolo atual foi recriado a partir da descrição. A troca é feita em um só lugar: `scripts/gerar-logo.cjs` → `src/components/brand/logo-paths.ts`.

## Dados do negócio (`src/lib/site.ts`)
- [ ] Endereço completo do Omoplata Hub (rua, número, bairro, CEP)
- [ ] Horário de funcionamento
- [ ] Domínio final do site
- [ ] @ do Instagram
- [ ] Responsável técnico: nome e CREFITO
- [ ] Faixa de preço (schema.org, em `src/app/layout.tsx`)

## Equipe (`src/components/sections/Equipe.tsx`)
- [ ] Emerson Eduardo: cargo, especialidade, CREFITO, frase
- [ ] Camila MB de Souza: especialidade, CREFITO, frase
- [ ] Terceiro profissional: nome, cargo, registro, frase
- [ ] Retratos reais (hoje são fotos de mãos em duotone)

## Conteúdo
- [ ] Depoimentos reais do Google, com autorização (`Depoimentos.tsx`; autores hoje estão como "[Nome]")
- [ ] Respostas do "Antes de agendar": convênio/reembolso, duração e valor da avaliação, o que vestir (`Contato.tsx`)
- [ ] Esportes atendidos além do beach tennis (`Performance.tsx`)

## Fotos (todas provisórias, Unsplash, ver CREDITOS.md)
- [ ] Fotos reais do Omoplata Hub (painel de madeira, parede azul, bolas, reformers) para "O espaço"
- [ ] Fotos de atendimento real para os três serviços
- [ ] Opcional: vídeo para "Do detalhe ao movimento" (troca a foto por sequência de quadros)
- Depois de trocar os arquivos: `npm run imagens`

## Rastreamento
- [ ] IDs do GA4/GTM e do Meta Pixel. Os CTAs já disparam `whatsapp_click` (GA4) e `Contact` (Pixel).
