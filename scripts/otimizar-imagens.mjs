// Uso: node scripts/otimizar-imagens.mjs <pasta-com-originais>
// Gera AVIF + WebP em 3 larguras em public/img e o manifesto src/lib/images.json
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
const out = "public/img";
fs.mkdirSync(out, { recursive: true });
// nome final <- arquivo original
const MAP = {
  "costas-luz": "back-dramatic", "reformer-footwork": "reformer", "fisio-alongamento": "back-press",
  "massagem-costas": "massage-back", "pilates-estudio-vertical": "machines-plant", "atleta-padel-salto": "padel-indoor",
  "atleta-tenis-saque": "tennis-reach", "atleta-padel-quadra": "padel-blue", "espaco-reformers-madeira": "equip-room",
  "espaco-parede-madeira": "equip-wall", "espaco-salao": "studio-reformers", "espaco-janelas": "yoga-windows",
  "equipe-ombro": "shoulder", "equipe-antebraco": "forearm", "equipe-maos": "hands-towel", "presente-massagem": "massage-herbal",
};
const manifest = {};
for (const [name, file] of Object.entries(MAP)) {
  const input = path.join(src, file + ".jpg");
  const meta = await sharp(input).metadata();
  const widths = [640, 1280, 1920].filter((w) => w <= meta.width);
  for (const w of widths) {
    const img = sharp(input).resize({ width: w }).withMetadata({});
    await img.clone().avif({ quality: 52, effort: 5 }).toFile(`${out}/${name}-${w}.avif`);
    await img.clone().webp({ quality: 74 }).toFile(`${out}/${name}-${w}.webp`);
  }
  // cor média (placeholder enquanto carrega)
  const { dominant } = await sharp(input).stats();
  manifest[name] = { w: meta.width, h: meta.height, widths, color: `rgb(${dominant.r},${dominant.g},${dominant.b})` };
}
fs.writeFileSync("src/lib/images.json", JSON.stringify(manifest, null, 2));
console.log("ok", Object.keys(manifest).length);
