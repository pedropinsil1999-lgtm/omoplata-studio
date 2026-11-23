// Monta design/etapa-1.html a partir do template (fontes e motor embutidos)
const fs = require('fs');
const p = (f) => require('path').join(__dirname, '..', f);
const b64 = (f) => fs.readFileSync(p(f)).toString('base64');
const strip = (s) => s.replace(/<\?xml[^>]*>/, '').trim();
const symbol = strip(fs.readFileSync(p('public/brand/omoplata-simbolo.svg'), 'utf8'));
const lockup = strip(fs.readFileSync(p('public/brand/omoplata-logo-horizontal.svg'), 'utf8'));
let html = fs.readFileSync(p('design/etapa-1.template.html'), 'utf8');
const map = {
  GS500: b64('src/fonts/GeneralSans-500.woff2'),
  GS600: b64('src/fonts/GeneralSans-600.woff2'),
  IS: b64('src/fonts/InstrumentSerif-Italic.woff2'),
  FIELD_JS: fs.readFileSync(process.argv[2], 'utf8'),
  SYMBOL_LIVE: symbol.replace('<svg ', '<svg class="symbol-live" '),
  LOCKUP: lockup.replace('<svg ', '<svg aria-label="OMOPLATA Studio" '),
  LOCKUP_LIGHT: lockup.replace('<svg ', '<svg class="lockup" '),
  LOCKUP_VIOLET: lockup.replace('<svg ', '<svg class="lockup" '),
};
for (const [k, v] of Object.entries(map)) html = html.split(`{{${k}}}`).join(v);
fs.writeFileSync(p('design/etapa-1.html'), html);
console.log('ok', (html.length / 1024).toFixed(0) + ' kB', 'travessões:', (html.match(/—/g) || []).length);
