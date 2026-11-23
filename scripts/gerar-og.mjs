// Gera public/og.png (1200x630) e public/apple-touch-icon.png com a marca.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");

const font = (f) => "data:font/woff2;base64," + fs.readFileSync(path.join("src/fonts", f)).toString("base64");
const symbol = fs.readFileSync("public/brand/omoplata-simbolo.svg", "utf8");
const lockup = fs.readFileSync("public/brand/omoplata-logo-horizontal.svg", "utf8");
// grade de squircles (o "campo") como fundo
let grid = "";
for (let y = -1; y < 8; y++)
  for (let x = -1; x < 13; x++)
    for (const [a, o] of [[0.86, 0.5], [0.58, 0.4], [0.3, 0.3]]) {
      const s = 108 * a, cx = x * 108 + 54, cy = y * 108 + 54;
      const hot = Math.hypot(cx - 960, cy - 200) < 230;
      grid += `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s * 0.42}" fill="none" stroke="${hot ? "#7d63f2" : "#4f6f79"}" stroke-width="${hot ? 2 : 1}" opacity="${o}"/>`;
    }
const html = `<html><head><style>
@font-face{font-family:GS;src:url(${font("GeneralSans-600.woff2")});font-weight:600}
@font-face{font-family:GS;src:url(${font("GeneralSans-500.woff2")});font-weight:500}
@font-face{font-family:IS;src:url(${font("InstrumentSerif-Italic.woff2")});font-style:italic}
body{margin:0;width:1200px;height:630px;background:#0F1F24;color:#F4F1EC;font-family:GS;position:relative;overflow:hidden}
svg.g{position:absolute;inset:0;transform:rotate(-6deg) scale(1.15)}
.v{position:absolute;inset:0;background:linear-gradient(90deg,#0F1F24 30%,rgba(15,31,36,.2) 75%)}
.c{position:absolute;left:72px;top:70px;bottom:64px;display:flex;flex-direction:column;justify-content:space-between}
.lk{height:44px;color:#F4F1EC}.lk svg{height:44px;width:auto}
h1{margin:0;font-weight:600;font-size:96px;line-height:.9;letter-spacing:-.045em}
h1 em{font-family:IS;font-weight:400;color:#7D63F2;font-size:1.1em}
p{margin:18px 0 0;font-weight:500;font-size:26px;color:#8FA8AF}
</style></head><body><svg class="g" viewBox="0 0 1200 630">${grid}</svg><div class="v"></div>
<div class="c"><div class="lk">${lockup}</div><div><h1>Performance.<br>Reequilíbrio.<br><em>Bem-estar.</em></h1>
<p>Fisioterapia, massoterapia e pilates · Resende/RJ</p></div></div></body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: "public/og.png" });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0;background:#2E4A54">${symbol.replace("<svg ", '<svg width="180" height="180" ')}</body>`);
await p.screenshot({ path: "public/apple-touch-icon.png" });
await b.close();
console.log("ok");
