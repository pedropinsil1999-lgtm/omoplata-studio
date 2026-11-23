// Uso: node scripts/rastrear-logo.cjs <imagem-do-logo-real.webp>
// Rastreia o traço branco do arquivo real do cliente (potrace) e gera:
//  - public/brand/omoplata-simbolo.svg / -linha.svg
//  - src/components/brand/logo-paths.ts (INK_PATH, BG_OUTER, WORDMARK)
const potrace = require("potrace");
const sharp = require("sharp");
const opentype = require("opentype.js");
const fs = require("fs");

const SRC = process.argv[2];
if (!SRC) throw new Error("uso: node scripts/rastrear-logo.cjs <arquivo.webp>");

const r2 = (n) => Math.round(n * 1000) / 1000;
function squircle(cx, cy, a, n = 4.6, steps = 96) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = Math.PI / 2 + (i / steps) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    pts.push([r2(cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n)), r2(cy + a * Math.sign(s) * Math.pow(Math.abs(s), 2 / n))]);
  }
  return "M" + pts.map((p) => p.join(" ")).join("L") + "Z";
}
const BG_OUTER = squircle(60, 60, 60, 4.6);

async function main() {
  const raw = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i] > 150 && data[i + 1] > 150 && data[i + 2] > 150) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  const pad = 40;
  const tmp = "/tmp/_logo_crop.png";
  await sharp(SRC)
    .extract({ left: Math.max(0, minX - pad), top: Math.max(0, minY - pad), width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 })
    .resize(900, 900, { fit: "fill" })
    .greyscale()
    .toFile(tmp);

  const svg = await new Promise((res, rej) =>
    potrace.trace(tmp, { threshold: 140, blackOnWhite: false, turdSize: 2, optTolerance: 0.25, alphaMax: 1 }, (err, svg) => (err ? rej(err) : res(svg))),
  );
  const d = svg.match(/<path d="([^"]+)"/)[1];
  // normaliza do canvas 900 (rastreado) para o viewBox 0..120 do resto da marca
  const scale = 120 / 900;
  const inkPath = d.replace(/-?\d+\.\d+|-?\d+/g, (n) => r2(parseFloat(n) * scale));

  // --- wordmark OMOPLATA em curvas (General Sans 600), igual à geração anterior ---
  const font = opentype.parse(fs.readFileSync("scripts/GeneralSans-600.ttf").buffer.slice(0));
  const size = 40, track = 0.28 * size;
  let x = 0; const parts = [];
  for (const ch of "OMOPLATA") {
    const g = font.charToGlyph(ch);
    parts.push(g.getPath(x, 0, size).toPathData(2));
    x += (g.advanceWidth * size) / font.unitsPerEm + track;
  }
  const wordW = x - track;
  const cap = (font.tables.os2.sCapHeight * size) / font.unitsPerEm;

  const ts = `// Gerado por scripts/rastrear-logo.cjs a partir do arquivo real do cliente. Não editar à mão.
export const BG_OUTER = ${JSON.stringify(BG_OUTER)};
export const INK_PATH = ${JSON.stringify(inkPath)};
export const WORDMARK = { d: ${JSON.stringify(parts.join(""))}, width: ${r2(wordW)}, cap: ${r2(cap)} };
`;
  fs.writeFileSync("src/components/brand/logo-paths.ts", ts);

  // arquivos estáticos (favicon, OG, apple-touch-icon)
  fs.writeFileSync(
    "public/brand/omoplata-simbolo.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="OMOPLATA">\n<path d="${BG_OUTER}" fill="#2E4A54"/>\n<path d="${inkPath}" fill="#fff" fill-rule="evenodd"/>\n</svg>`,
  );
  fs.writeFileSync(
    "public/brand/omoplata-simbolo-linha.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true">\n<path d="${inkPath}" fill="currentColor" fill-rule="evenodd"/>\n</svg>`,
  );
  const symH = 72, gap = 26, baseY = symH / 2 + cap / 2;
  const W = r2(symH + gap + wordW);
  fs.writeFileSync(
    "public/brand/omoplata-logo-horizontal.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${symH}" role="img" aria-label="OMOPLATA Studio">\n<g transform="scale(${symH / 120})"><path d="${BG_OUTER}" fill="#2E4A54"/><path d="${inkPath}" fill="#fff" fill-rule="evenodd"/></g>\n<g transform="translate(${symH + gap} ${r2(baseY)})" fill="currentColor"><path d="${parts.join("")}"/></g>\n</svg>`,
  );
  console.log("ok, ink path length", inkPath.length);
}
main();
