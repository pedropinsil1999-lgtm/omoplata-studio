/**
 * SquircleField: o padrão do logo OMOPLATA como campo vivo.
 *
 * Canvas 2D (sem WebGL): ~150 células x 3 camadas cabem com folga em 2D e
 * agrupamos os traços em "baldes" de energia, então o frame custa poucas
 * chamadas de stroke(). Zero dependências, ~5 kB minificado.
 *
 * Física: cada célula é uma mola amortecida (deslocamento + energia),
 * integrada em passo fixo de 1/120 s para o comportamento ser igual a 60 Hz
 * ou 120 Hz.
 */

export type FieldTheme = {
  line: string; // cor das linhas em repouso
  lineAlpha: number;
  active: string; // cor perto do cursor
  peak: string; // cor no pico da energia
  halo: string; // brilho do cursor
  haloAlpha: number;
};

export const THEMES = {
  petrol: {
    line: "#4f6f79",
    lineAlpha: 0.5,
    active: "#7d63f2",
    peak: "#9c8bf2",
    halo: "#5ee6d8",
    haloAlpha: 0.075,
  },
  violet: {
    line: "#8f7af0",
    lineAlpha: 0.55,
    active: "#c9bfff",
    peak: "#ffffff",
    halo: "#5ee6d8",
    haloAlpha: 0.12,
  },
} satisfies Record<string, FieldTheme>;

export type FieldOptions = {
  cell?: number; // tamanho da célula em px (CSS)
  layers?: number;
  radius?: number; // raio de influência do cursor
  push?: number; // deslocamento máximo das células
  theme?: FieldTheme;
  reducedMotion?: boolean;
  /** Quanto o campo gira (graus) por viewport rolada */
  scrollTwist?: number;
};

type Cell = {
  hx: number; // posição de repouso (espaço da grade)
  hy: number;
  dx: number; // deslocamento atual
  dy: number;
  vx: number;
  vy: number;
  e: number; // energia 0..1 (cor, espessura, abertura das camadas)
  ve: number;
  seed: number;
};

type Ripple = { x: number; y: number; t: number };

const UNIT_STEPS = 44;
const BUCKETS = 10;
const ALPHA_LEVELS = 3;

/** Contorno unitário de superelipse (mesmo n do logo) */
function unitSquircle(n = 4.2, steps = UNIT_STEPS) {
  const pts = new Float32Array(steps * 2);
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    pts[i * 2] = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    pts[i * 2 + 1] = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
  }
  return pts;
}

const hexToRgb = (h: string) => {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255] as const;
};
const mix = (a: readonly number[], b: readonly number[], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
const smooth = (x: number) => x * x * (3 - 2 * x);

export class SquircleField {
  private ctx: CanvasRenderingContext2D;
  private o: Required<Omit<FieldOptions, "theme">>;
  private theme: FieldTheme;
  private unit = unitSquircle();
  private cells: Cell[] = [];
  private ripples: Ripple[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private time = 0;
  private visible = true;
  private running = false;

  // ponteiro (real e suavizado) e "força" do ponteiro (0 quando sai da tela)
  private px = -9999;
  private py = -9999;
  private spx = -9999;
  private spy = -9999;
  private pStrength = 0;
  private pTarget = 0;

  // scroll
  private scrollY = 0;
  private sScroll = 0;
  private scrollVel = 0;

  // zonas de leitura: células atrás de texto ficam mais apagadas
  private quiet: DOMRect[] = [];
  private quietEls: Element[] = [];

  private styleCache: string[][] = [];
  private cleanup: (() => void)[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    opts: FieldOptions = {},
  ) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D indisponível");
    this.ctx = ctx;
    this.theme = opts.theme ?? THEMES.petrol;
    this.o = {
      cell: opts.cell ?? 112,
      layers: opts.layers ?? 3,
      radius: opts.radius ?? 280,
      push: opts.push ?? 26,
      reducedMotion: opts.reducedMotion ?? false,
      scrollTwist: opts.scrollTwist ?? 4,
    };
    this.buildStyles();
    this.bind();
    this.resize();
  }

  /* ------------------------------------------------------------ API --- */

  start() {
    if (this.o.reducedMotion) {
      this.draw(); // estático: desenhado uma vez
      return;
    }
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    this.cleanup.forEach((f) => f());
  }

  setTheme(theme: FieldTheme) {
    this.theme = theme;
    this.buildStyles();
    if (this.o.reducedMotion) this.draw();
  }

  /** Chamado pelo Lenis/ScrollTrigger (ou window.scrollY no protótipo) */
  setScroll(y: number) {
    this.scrollY = y;
    if (this.o.reducedMotion) {
      this.sScroll = y;
      this.draw();
    }
  }

  /** Elementos de texto sobre o campo: as linhas atrás deles apagam */
  setQuietZones(els: Element[]) {
    this.quietEls = els;
    this.measureQuiet();
  }

  /** Onda a partir de um ponto (toque no mobile, clique no desktop, saída do preloader) */
  pulse(x: number, y: number) {
    this.ripples.push({ x, y, t: 0 });
    if (this.ripples.length > 6) this.ripples.shift();
  }

  /* ------------------------------------------------------- internals --- */

  private bind() {
    const c = this.canvas;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = c.getBoundingClientRect();
      this.px = e.clientX - r.left;
      this.py = e.clientY - r.top;
      if (this.spx < -999) {
        this.spx = this.px;
        this.spy = this.py;
      }
      this.pTarget = 1;
    };
    const onLeave = () => (this.pTarget = 0);
    const onDown = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      this.pulse(e.clientX - r.left, e.clientY - r.top);
    };
    // O canvas fica atrás do conteúdo (pointer-events: none), então ouvimos a janela
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(c);

    const io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.syncRunning();
    });
    io.observe(c);

    const onVis = () => this.syncRunning();
    document.addEventListener("visibilitychange", onVis);

    const onScrollMeasure = () => this.measureQuiet();
    window.addEventListener("scroll", onScrollMeasure, { passive: true });

    this.cleanup.push(
      () => window.removeEventListener("pointermove", onMove),
      () => window.removeEventListener("pointerdown", onDown),
      () => document.removeEventListener("pointerleave", onLeave),
      () => window.removeEventListener("blur", onLeave),
      () => ro.disconnect(),
      () => io.disconnect(),
      () => document.removeEventListener("visibilitychange", onVis),
      () => window.removeEventListener("scroll", onScrollMeasure),
    );
  }

  private syncRunning() {
    const shouldRun = this.visible && !document.hidden;
    if (shouldRun && !this.running) this.start();
    else if (!shouldRun && this.running) this.stop();
  }

  private measureQuiet() {
    this.quiet = this.quietEls.map((el) => el.getBoundingClientRect());
    const cr = this.canvas.getBoundingClientRect();
    this.quiet = this.quiet.map((r) => new DOMRect(r.left - cr.left, r.top - cr.top, r.width, r.height));
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    // No celular, células menores para manter a densidade de "revista"
    const cell = this.w < 640 ? Math.max(76, this.o.cell * 0.7) : this.o.cell;
    // Grade maior que a tela: ao girar, as bordas nunca aparecem
    const diag = Math.hypot(this.w, this.h);
    const cols = Math.ceil(diag / cell) + 2;
    const rows = Math.ceil(diag / cell) + 4; // + folga para o deslize vertical
    const ox = this.w / 2 - (cols * cell) / 2 + cell / 2;
    const oy = this.h / 2 - (rows * cell) / 2 + cell / 2;
    this.cells = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++)
        this.cells.push({
          hx: ox + i * cell,
          hy: oy + j * cell,
          dx: 0,
          dy: 0,
          vx: 0,
          vy: 0,
          e: 0,
          ve: 0,
          seed: ((i * 73856093) ^ (j * 19349663)) % 1000 / 1000,
        });
    this.cellSize = cell;
    this.measureQuiet();
    this.draw();
  }
  private cellSize = 112;

  private buildStyles() {
    const t = this.theme;
    const line = hexToRgb(t.line);
    const act = hexToRgb(t.active);
    const peak = hexToRgb(t.peak);
    // [balde de energia][nível de opacidade] -> cor CSS
    this.styleCache = [];
    for (let b = 0; b < BUCKETS; b++) {
      const k = b / (BUCKETS - 1);
      const col = k < 0.6 ? mix(line, act, smooth(k / 0.6)) : mix(act, peak, smooth((k - 0.6) / 0.4));
      const row: string[] = [];
      for (let a = 0; a < ALPHA_LEVELS; a++) {
        const quietMul = [1, 0.55, 0.28][a];
        const alpha = (t.lineAlpha + (1 - t.lineAlpha) * k * 0.9) * quietMul;
        row.push(col.replace("rgb(", "rgba(").replace(")", `,${alpha.toFixed(3)})`));
      }
      this.styleCache.push(row);
    }
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, 1 / 20);
    this.last = now;
    this.acc += dt;
    const STEP = 1 / 120;
    while (this.acc >= STEP) {
      this.step(STEP);
      this.acc -= STEP;
    }
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(dt: number) {
    this.time += dt;
    // ponteiro suavizado (sem tremer) e entrada/saída gradual
    const follow = 1 - Math.exp(-dt * 14);
    this.spx += (this.px - this.spx) * follow;
    this.spy += (this.py - this.spy) * follow;
    this.pStrength += (this.pTarget - this.pStrength) * (1 - Math.exp(-dt * 5));

    // scroll suavizado + velocidade (abre as camadas quando rola rápido)
    const prev = this.sScroll;
    this.sScroll += (this.scrollY - this.sScroll) * (1 - Math.exp(-dt * 8));
    const v = (this.sScroll - prev) / dt;
    this.scrollVel += (Math.min(Math.abs(v) / 2400, 1) - this.scrollVel) * (1 - Math.exp(-dt * 6));

    for (const r of this.ripples) r.t += dt;
    this.ripples = this.ripples.filter((r) => r.t < 2.2);

    const { radius, push } = this.o;
    const K = 140; // rigidez
    const C = 15; // amortecimento (crítico seria ~23.7: leve "balanço" de tecido)
    const { rot, cx, cy, slide } = this.frameTransform();
    const cos = Math.cos(-rot);
    const sin = Math.sin(-rot);
    // ponteiro no espaço da grade (desfaz rotação e deslize)
    const gx = cx + (this.spx - cx) * cos - (this.spy - cy) * sin;
    const gy = cy + (this.spx - cx) * sin + (this.spy - cy) * cos - slide;
    const ripG = this.ripples.map((r) => ({
      x: cx + (r.x - cx) * cos - (r.y - cy) * sin,
      y: cy + (r.x - cx) * sin + (r.y - cy) * cos - slide,
      t: r.t,
    }));

    for (const c of this.cells) {
      let tx = 0;
      let ty = 0;
      let te = 0;
      // cursor: empurra para fora e energiza
      if (this.pStrength > 0.001) {
        const ddx = c.hx - gx;
        const ddy = c.hy - gy;
        const d = Math.hypot(ddx, ddy);
        if (d < radius) {
          const f = smooth(1 - d / radius) * this.pStrength;
          const inv = d > 0.001 ? 1 / d : 0;
          tx += ddx * inv * push * f;
          ty += ddy * inv * push * f;
          te = Math.max(te, f);
        }
      }
      // ondas: anel que se propaga a ~520 px/s e perde força
      for (const r of ripG) {
        const ddx = c.hx - r.x;
        const ddy = c.hy - r.y;
        const d = Math.hypot(ddx, ddy);
        const front = r.t * 520;
        const ring = Math.exp(-(((d - front) / 90) ** 2)) * Math.max(0, 1 - r.t / 2.2);
        if (ring > 0.01) {
          const inv = d > 0.001 ? 1 / d : 0;
          tx += ddx * inv * push * 0.9 * ring;
          ty += ddy * inv * push * 0.9 * ring;
          te = Math.max(te, ring);
        }
      }
      c.vx += (K * (tx - c.dx) - C * c.vx) * dt;
      c.vy += (K * (ty - c.dy) - C * c.vy) * dt;
      c.dx += c.vx * dt;
      c.dy += c.vy * dt;
      c.ve += (K * 0.6 * (te - c.e) - C * 0.8 * c.ve) * dt;
      c.e += c.ve * dt;
    }
  }

  private frameTransform() {
    const vh = this.h || 1;
    const p = this.sScroll / vh; // viewports rolados
    const deg = -6 + p * this.o.scrollTwist + Math.sin(this.time * 0.12) * 0.35;
    const rot = (deg * Math.PI) / 180;
    const slide = -((this.sScroll * 0.18) % (this.cellSize * 2));
    return { rot, cx: this.w / 2, cy: this.h / 2, slide, p };
  }

  private quietLevel(x: number, y: number) {
    let level = 0;
    for (const r of this.quiet) {
      const pad = 40;
      if (x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad) {
        const inside = x > r.left && x < r.right && y > r.top && y < r.bottom;
        level = Math.max(level, inside ? 2 : 1);
      }
    }
    return level;
  }

  private draw() {
    const { ctx, dpr, unit } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const { rot, cx, cy, slide, p } = this.frameTransform();
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const L = this.o.layers;
    const half = this.cellSize / 2;
    const breathe = this.scrollVel * 0.1;

    // um Path2D por (balde de energia x nível de opacidade)
    const paths: (Path2D | null)[] = new Array(BUCKETS * ALPHA_LEVELS).fill(null);
    const widths = new Float32Array(BUCKETS);
    for (let b = 0; b < BUCKETS; b++) widths[b] = 1 + (b / (BUCKETS - 1)) * 1.6;

    for (const c of this.cells) {
      const gx = c.hx + c.dx;
      const gy = c.hy + c.dy + slide;
      const sx = cx + (gx - cx) * cos - (gy - cy) * sin;
      const sy = cy + (gx - cx) * sin + (gy - cy) * cos;
      if (sx < -half * 1.6 || sx > this.w + half * 1.6 || sy < -half * 1.6 || sy > this.h + half * 1.6) continue;

      const e = Math.max(0, Math.min(1, c.e));
      const b = Math.min(BUCKETS - 1, Math.round(e * (BUCKETS - 1)));
      const q = this.quietLevel(sx, sy);
      const key = b * ALPHA_LEVELS + q;
      const path = (paths[key] ??= new Path2D());

      // cada célula gira um pouco com o scroll (direção alternada pela semente)
      const twist = rot + (c.seed - 0.5) * 0.05 + p * (c.seed > 0.5 ? 0.06 : -0.06) + e * 0.12;
      const tc = Math.cos(twist);
      const ts = Math.sin(twist);
      // direção do empurrão: as camadas internas descentralizam (tecido pressionado)
      const mag = Math.hypot(c.dx, c.dy) || 1;
      const nx = c.dx / mag;
      const ny = c.dy / mag;

      for (let l = 0; l < L; l++) {
        const k = (l + 1) / L; // 1/3, 2/3, 1
        const a = half * (0.3 + 0.56 * k) * (1 + (e * 0.22 + breathe) * k);
        const shift = e * (1 - k) * 7;
        const ox = sx - (nx * cos - ny * sin) * shift;
        const oy = sy - (nx * sin + ny * cos) * shift;
        for (let i = 0; i < UNIT_STEPS; i++) {
          const ux = unit[i * 2] * a;
          const uy = unit[i * 2 + 1] * a;
          const x = ox + ux * tc - uy * ts;
          const y = oy + ux * ts + uy * tc;
          if (i === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        path.closePath();
      }
    }

    ctx.lineJoin = "round";
    for (let key = 0; key < paths.length; key++) {
      const path = paths[key];
      if (!path) continue;
      const b = Math.floor(key / ALPHA_LEVELS);
      const q = key % ALPHA_LEVELS;
      ctx.strokeStyle = this.styleCache[b][q];
      ctx.lineWidth = widths[b];
      ctx.stroke(path);
    }

    // halo água-marinha bem sutil
    if (this.pStrength > 0.01 && this.theme.haloAlpha > 0) {
      const [r, g, bl] = hexToRgb(this.theme.halo);
      const grd = ctx.createRadialGradient(this.spx, this.spy, 0, this.spx, this.spy, this.o.radius * 0.9);
      grd.addColorStop(0, `rgba(${r},${g},${bl},${this.theme.haloAlpha * this.pStrength})`);
      grd.addColorStop(1, `rgba(${r},${g},${bl},0)`);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = grd;
      ctx.fillRect(this.spx - this.o.radius, this.spy - this.o.radius, this.o.radius * 2, this.o.radius * 2);
      ctx.globalCompositeOperation = "source-over";
    }
  }
}
