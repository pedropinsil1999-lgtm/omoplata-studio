// Uso: node scripts/gerar-logo.cjs public/brand scripts/GeneralSans-600.ttf src/components/brand/logo-paths.ts
// Gera o símbolo OMOPLATA: superelipses (squircles) concêntricas.
const fs = require('fs');
const opentype = require('opentype.js');
const out = process.argv[2];
const ttf = process.argv[3];
const r2 = n => Math.round(n * 100) / 100;
// Superelipse |x/a|^n + |y/a|^n = 1, começando no meio do lado inferior (ponto de partida do desenho)
function squircle(cx, cy, a, n = 4.2, steps = 160) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = Math.PI / 2 + (i / steps) * Math.PI * 2; // começa embaixo, sentido horário
    const c = Math.cos(t), s = Math.sin(t);
    const x = cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = cy + a * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push([r2(x), r2(y)]);
  }
  return 'M' + pts.map(p => p.join(' ')).join('L') + 'Z';
}
const outer = squircle(60, 60, 60, 4.6);
// Camadas: meio-lados com espaçamento constante; traço uniforme
const layers = [12, 23, 34, 45].map(a => squircle(60, 60, a, 4.2));
const symbolInner = (stroke = '#fff') =>
  layers.map((d, i) => `<path class="om-layer om-layer-${i + 1}" d="${d}" fill="none" stroke="${stroke}" stroke-width="3.4" stroke-linejoin="round" pathLength="1"/>`).join('\n  ');
const symbol = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="OMOPLATA">
  <path class="om-base" d="${outer}" fill="#2E4A54"/>
  ${symbolInner()}
</svg>`;
fs.writeFileSync(`${out}/omoplata-simbolo.svg`, symbol);
// Versão em linha (sem base), para usar sobre fundos escuros / cortinas
fs.writeFileSync(`${out}/omoplata-simbolo-linha.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true">
  <path d="${outer}" fill="none" stroke="currentColor" stroke-width="2"/>
  ${symbolInner('currentColor')}
</svg>`);
// Wordmark em curvas: General Sans 600, tracking 0.28em
const font = opentype.parse(fs.readFileSync(ttf).buffer.slice(0));
const size = 40, track = 0.28 * size;
let x = 0; const parts = [];
for (const ch of 'OMOPLATA') {
  const g = font.charToGlyph(ch);
  parts.push(g.getPath(x, 0, size).toPathData(2));
  x += g.advanceWidth * size / font.unitsPerEm + track;
}
const wordW = x - track;
const cap = font.tables.os2.sCapHeight * size / font.unitsPerEm;
const gap = 26, symH = 72;
const baseY = symH / 2 + cap / 2;
const W = r2(symH + gap + wordW);
const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${symH}" role="img" aria-label="OMOPLATA Studio">
  <g transform="scale(${symH / 120})">
  <path d="${outer}" fill="#2E4A54"/>
  ${symbolInner()}
  </g>
  <g transform="translate(${symH + gap} ${r2(baseY)})" fill="currentColor"><path d="${parts.join('')}"/></g>
</svg>`;
fs.writeFileSync(`${out}/omoplata-logo-horizontal.svg`, lockup);
// Módulo TS usado pelos componentes React (pontos reduzidos)
const o2 = squircle(60, 60, 60, 4.6, 96);
const l2 = [12, 23, 34, 45].map(a => squircle(60, 60, a, 4.2, 96));
const ts = `// Gerado por scripts/gerar-logo.cjs. Não editar à mão.
export const SYMBOL_OUTER = ${JSON.stringify(o2)};
export const SYMBOL_LAYERS = ${JSON.stringify(l2)};
export const WORDMARK = { d: ${JSON.stringify(parts.join(''))}, width: ${r2(wordW)}, cap: ${r2(cap)} };
`;
fs.writeFileSync(process.argv[4], ts);
console.log('ok', W, cap);
