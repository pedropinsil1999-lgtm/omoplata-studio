// Gera public/coluna/<regiao>.webp (fundo transparente) a partir da escultura 3D.
// Uso: com `npm run dev` rodando na porta 3100: node scripts/render-coluna.mjs
import { createRequire } from "node:module";
// Playwright vem pré-instalado no ambiente (global); em outra máquina: npm i -D playwright
const { chromium } = createRequire(import.meta.url)("playwright");
import sharp from "sharp";
import fs from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const REGIONS = ["nenhuma", "pescoco", "ombros", "lombar", "coluna", "performance"];
fs.mkdirSync("public/coluna", { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 400, height: 500 }, deviceScaleFactor: 2 });
for (const r of REGIONS) {
  await page.goto(`${BASE}/render-coluna?r=${r}&bg=none`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(4500); // a escultura "assenta" no ângulo da região
  const buf = await page.screenshot({ omitBackground: true });
  await sharp(buf).webp({ quality: 82, alphaQuality: 90 }).toFile(`public/coluna/${r}.webp`);
  console.log("ok", r);
}
await browser.close();
