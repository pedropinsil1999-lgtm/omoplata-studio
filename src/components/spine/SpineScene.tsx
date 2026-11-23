"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

export type Region = "nenhuma" | "pescoco" | "ombros" | "lombar" | "coluna" | "performance";

type Seg = "C" | "T" | "L" | "S";
type Vert = { seg: Seg; idx: number; pos: THREE.Vector3; tan: THREE.Vector3; scale: number };

/* ----------------------------------------------------------------------------
 * Anatomia (unidades arbitrárias, y para cima, z para a FRENTE do corpo)
 * Curva S: lordose cervical, cifose torácica, lordose lombar.
 * -------------------------------------------------------------------------- */
const CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.0, -0.35), // sacro
    new THREE.Vector3(0, 0.9, 0.12),
    new THREE.Vector3(0, 1.75, 0.32), // L3 (lordose)
    new THREE.Vector3(0, 2.7, 0.05), // T12/L1
    new THREE.Vector3(0, 3.9, -0.38), // T7 (cifose)
    new THREE.Vector3(0, 5.1, -0.12), // T1
    new THREE.Vector3(0, 5.85, 0.16), // C4 (lordose)
    new THREE.Vector3(0, 6.55, 0.08), // C1
  ],
  false,
  "centripetal",
);

function buildVertebrae(): Vert[] {
  const list: { seg: Seg; n: number; scale: [number, number] }[] = [
    { seg: "L", n: 5, scale: [1.18, 1.05] },
    { seg: "T", n: 12, scale: [1.0, 0.74] },
    { seg: "C", n: 7, scale: [0.66, 0.56] },
  ];
  // cada vértebra ocupa (corpo 0.30 + disco 0.07) * escala ao longo da curva
  const UNIT = 0.37;
  const raw: { seg: Seg; idx: number; scale: number }[] = [];
  for (const s of list)
    for (let i = 0; i < s.n; i++) {
      const f = s.n > 1 ? i / (s.n - 1) : 0;
      raw.push({ seg: s.seg, idx: s.seg === "L" ? 5 - i : s.seg === "T" ? 12 - i : 7 - i, scale: s.scale[0] + (s.scale[1] - s.scale[0]) * f });
    }
  const len = CURVE.getLength();
  const start = 0.07 * len;
  const avail = 0.93 * len - start;
  const sum = raw.reduce((a, r) => a + r.scale * UNIT, 0);
  const fit = avail / sum; // ajuste global para caber na curva
  let cum = start;
  return raw.map((r) => {
    const unit = r.scale * UNIT * fit;
    const u = (cum + unit * 0.4) / len;
    cum += unit;
    return { ...r, pos: CURVE.getPointAt(u), tan: CURVE.getTangentAt(u), scale: r.scale * fit };
  });
}

const regionOf = (v: Vert): Region[] => {
  const r: Region[] = ["coluna", "performance"];
  if (v.seg === "L") r.push("lombar");
  if (v.seg === "C") r.push("pescoco");
  if (v.seg === "T" && v.idx <= 8) r.push("ombros");
  if (v.seg === "C" && v.idx >= 6) r.push("ombros");
  return r;
};

/* ------------------------------ geometrias ------------------------------ */

/** Corpo vertebral: cilindro com cintura côncava e bordas arredondadas (lathe) */
function vertebraBodyGeo() {
  const pts: THREE.Vector2[] = [];
  const h = 0.3;
  const r = 0.34;
  const steps = 14;
  pts.push(new THREE.Vector2(0, -h / 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -h / 2 + t * h;
    // cintura: raio menor no meio; bordas (anel epifisário) arredondadas
    const waist = 1 - 0.1 * Math.sin(Math.PI * t);
    const edge = Math.min(1, Math.sin(Math.PI * Math.min(t, 1 - t) * 2.2 + 0.35));
    pts.push(new THREE.Vector2(r * waist * (0.86 + 0.14 * edge), y));
  }
  pts.push(new THREE.Vector2(0, h / 2));
  const g = new THREE.LatheGeometry(pts, 40);
  g.scale(1, 1, 0.82); // corpo levemente achatado no sentido ântero-posterior
  return g;
}

/** Omoplata: triângulo de cantos arredondados, levemente curvado para abraçar as costelas */
function scapulaGeo() {
  const s = new THREE.Shape();
  // pontos (x lateral, y vertical) para a escápula ESQUERDA vista por trás
  const A = new THREE.Vector2(0.0, 0.0); // ângulo inferior
  const B = new THREE.Vector2(-0.28, 1.55); // ângulo superior (medial)
  const C = new THREE.Vector2(0.78, 1.36); // ângulo lateral (glenoide)
  const R = 0.16;
  const corner = (p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2) => {
    const pa = a.clone().sub(p).normalize().multiplyScalar(R);
    const pb = b.clone().sub(p).normalize().multiplyScalar(R);
    return [p.clone().add(pa), p.clone().add(pb)] as const;
  };
  const [a1, a2] = corner(A, B, C);
  const [b1, b2] = corner(B, C, A);
  const [c1, c2] = corner(C, A, B);
  s.moveTo(a1.x, a1.y);
  // borda medial levemente convexa
  s.quadraticCurveTo(-0.22, 0.75, b2.x, b2.y);
  s.quadraticCurveTo(B.x, B.y, b1.x, b1.y);
  // borda superior com a incisura
  s.quadraticCurveTo(0.28, 1.34, c2.x, c2.y);
  s.quadraticCurveTo(C.x, C.y, c1.x, c1.y);
  // borda lateral (côncava, mais grossa)
  s.quadraticCurveTo(0.36, 0.55, a2.x, a2.y);
  s.quadraticCurveTo(A.x, A.y, a1.x, a1.y);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.05, bevelSegments: 5, curveSegments: 18 });
  g.translate(-0.25, -0.75, -0.025);
  // curvatura: dobra a placa em torno do eixo vertical
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, p.getZ(i) - x * x * 0.42);
  }
  g.computeVertexNormals();
  return g;
}

/* ------------------------------ materiais ------------------------------ */

const VIOLET = new THREE.Color("#5b3fe0");
const VIOLET_HOT = new THREE.Color("#6a4bff");
const AQUA = new THREE.Color("#2fbfb2");

function usePorcelain() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f3f1ec",
        roughness: 0.62,
        metalness: 0,
        clearcoat: 0.12,
        clearcoatRoughness: 0.6,
        sheen: 0.35,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color("#ffffff"),
        emissive: new THREE.Color("#5b3fe0"),
        emissiveIntensity: 0,
      }),
    [],
  );
}

/* ------------------------------ escultura ------------------------------ */

type Props = { region: Region; onSelect?: (r: Region) => void; interactive?: boolean };

const ANGLES: Record<Region, { y: number; x: number; lift: number; zoom: number }> = {
  nenhuma: { y: Math.PI - 0.55, x: 0.04, lift: 0, zoom: 1 },
  pescoco: { y: Math.PI - 0.7, x: 0.1, lift: -1.3, zoom: 1.28 },
  ombros: { y: Math.PI - 0.12, x: 0.02, lift: -0.65, zoom: 1.1 },
  lombar: { y: Math.PI - 0.82, x: -0.02, lift: 1.7, zoom: 1.22 },
  coluna: { y: Math.PI - 1.42, x: 0.0, lift: 0, zoom: 1 },
  performance: { y: Math.PI - 0.35, x: 0.03, lift: 0, zoom: 1 },
};

function Sculpture({ region, onSelect, interactive }: Props) {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const verts = useMemo(buildVertebrae, []);
  const bodyGeo = useMemo(vertebraBodyGeo, []);
  const scapGeo = useMemo(scapulaGeo, []);
  const capsule = useMemo(() => new THREE.CapsuleGeometry(0.07, 0.26, 8, 16), []);
  const arch = useMemo(() => new THREE.TorusGeometry(0.17, 0.05, 12, 28, Math.PI * 1.15), []);
  const disc = useMemo(() => new THREE.CylinderGeometry(0.335, 0.335, 0.06, 40), []);
  const porcelain = usePorcelain();
  const { pointer, camera } = useThree();

  // Um material por vértebra/disco para acender por região
  const vertMats = useMemo(() => verts.map(() => porcelain.clone()), [verts, porcelain]);
  const discMats = useMemo(
    () =>
      verts.slice(0, -1).map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#2a1f66",
            emissive: VIOLET.clone(),
            emissiveIntensity: 1.4,
            roughness: 0.4,
            toneMapped: false,
          }),
      ),
    [verts],
  );
  const scapMats = useMemo(() => [porcelain.clone(), porcelain.clone()], [porcelain]);
  const inRegion = useMemo(() => verts.map((v) => regionOf(v)), [verts]);

  // centro da região (para a luz violeta interna)
  const regionCenter = useMemo(() => {
    const c: Record<Region, THREE.Vector3> = {
      nenhuma: CURVE.getPointAt(0.5),
      pescoco: CURVE.getPointAt(0.93),
      ombros: new THREE.Vector3(0, 4.6, -0.7),
      lombar: CURVE.getPointAt(0.2),
      coluna: CURVE.getPointAt(0.5),
      performance: CURVE.getPointAt(0.5),
    };
    return c;
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const a = ANGLES[region];
    const k = 1 - Math.exp(-dt * 2.6);
    const t = state.clock.elapsedTime;
    const sway = Math.sin(t * 0.35) * 0.06;
    const ty = a.y + sway + pointer.x * 0.18;
    const tx = a.x + pointer.y * -0.05;
    g.rotation.y += (ty - g.rotation.y) * k;
    g.rotation.x += (tx - g.rotation.x) * k;
    g.position.y += (-3.25 + a.lift - g.position.y) * k;
    const cam = camera as THREE.PerspectiveCamera;
    cam.zoom += (a.zoom - cam.zoom) * k;
    cam.updateProjectionMatrix();

    // acende a região: discos violeta quentes, porcelana com leve emissão
    const pulse = 0.85 + Math.sin(t * 2.2) * 0.15;
    verts.forEach((_, i) => {
      const on = inRegion[i].includes(region);
      const m = vertMats[i];
      const target = on ? (region === "coluna" || region === "performance" ? 0.035 : 0.06) : 0;
      m.emissiveIntensity += (target - m.emissiveIntensity) * k;
      if (i < discMats.length) {
        const dm = discMats[i];
        const both = on && inRegion[i + 1].includes(region);
        const ti = both ? 2.3 * pulse : region === "nenhuma" ? 1.15 : 0.55;
        dm.emissiveIntensity += (ti - dm.emissiveIntensity) * k;
        dm.emissive.lerp(region === "performance" && both ? AQUA : both ? VIOLET_HOT : VIOLET, k);
      }
    });
    const shoulders = region === "ombros";
    scapMats.forEach((m) => (m.emissiveIntensity += ((shoulders ? 0.07 : 0) - m.emissiveIntensity) * k));
    if (light.current) {
      light.current.position.lerp(regionCenter[region], k);
      const li = region === "nenhuma" ? 2 : 5;
      light.current.intensity += (li - light.current.intensity) * k;
    }
  });

  const pick = (r: Region) => (e: { stopPropagation: () => void }) => {
    if (!interactive || !onSelect) return;
    e.stopPropagation();
    onSelect(r);
  };
  const primaryRegion = (i: number): Region => {
    const v = verts[i];
    if (v.seg === "L") return "lombar";
    if (v.seg === "C") return "pescoco";
    if (v.seg === "T" && v.idx <= 7) return "ombros";
    return "coluna";
  };

  const up = new THREE.Vector3(0, 1, 0);

  return (
    <group ref={group} rotation={[0, ANGLES.nenhuma.y, 0]} position={[0, -3.25, 0]}>
      <pointLight ref={light} color="#7d63f2" intensity={3} distance={4.5} decay={1.6} position={[0, 3, 0]} />

      {verts.map((v, i) => {
        const q = new THREE.Quaternion().setFromUnitVectors(up, v.tan);
        const s = v.scale;
        const isC = v.seg === "C";
        const isL = v.seg === "L";
        // processo espinhoso: mais longo e inclinado para baixo na torácica
        const spLen = isL ? 0.95 : isC ? (v.idx === 7 ? 1.05 : 0.7) : 1.15;
        const spTilt = isL ? 0.15 : isC ? 0.25 : 0.75;
        const trW = isL ? 1.0 : isC ? 0.75 : 0.85;
        return (
          <group key={i} position={v.pos} quaternion={q} scale={s} onClick={pick(primaryRegion(i))}>
            {/* corpo vertebral */}
            <mesh geometry={bodyGeo} material={vertMats[i]} />
            {/* arco (forame vertebral) atrás do corpo */}
            <mesh geometry={arch} material={vertMats[i]} position={[0, 0.02, -0.42]} rotation={[-Math.PI / 2, 0, Math.PI * -0.075]} />
            {/* processo espinhoso */}
            <mesh
              geometry={capsule}
              material={vertMats[i]}
              position={[0, -0.09 * spTilt * 2, -0.6 - 0.22 * spLen]}
              rotation={[Math.PI / 2 - spTilt, 0, 0]}
              scale={[isL ? 1.5 : 1.15, spLen * 1.25, isL ? 1.8 : 1.15]}
            />
            {/* processos transversos */}
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                geometry={capsule}
                material={vertMats[i]}
                position={[side * 0.33, 0.02, -0.36]}
                rotation={[0.25, side * 0.35, (side * Math.PI) / 2]}
                scale={[1, trW, 1]}
              />
            ))}
            {/* disco de luz até a próxima vértebra */}
            {i < verts.length - 1 && (
              <mesh
                geometry={disc}
                material={discMats[i]}
                position={[0, 0.19, 0]}
                scale={[0.97, 1, 0.82]}
              />
            )}
          </group>
        );
      })}

      {/* omoplatas, na altura de T2 a T7, afastadas da coluna, viradas para trás */}
      {[-1, 1].map((side, k) => (
        <group key={side} position={[side * 0.86, 4.15, -0.78]} rotation={[0.1, side * 0.42 + Math.PI, side * 0.05]} onClick={pick("ombros")}>
          <mesh geometry={scapGeo} material={scapMats[k]} scale={[-side, 1, 1]} />
          {/* espinha da escápula + acrômio */}
          <mesh material={scapMats[k]} position={[side * -0.12, 0.5, -0.08]} rotation={[0, 0, side * 1.38]} scale={[1.2, 1.9, 1.2]}>
            <capsuleGeometry args={[0.05, 0.42, 6, 12]} />
          </mesh>
          <mesh material={scapMats[k]} position={[side * -0.55, 0.6, -0.06]} scale={[1.6, 0.8, 1]}>
            <sphereGeometry args={[0.09, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Pausa o render quando o canvas sai da tela */
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: "100px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return v;
}

export default function SpineScene({
  region,
  onSelect,
  interactive = false,
  className,
  transparent = true,
}: Props & { className?: string; transparent?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  return (
    <div ref={wrap} className={className} data-cursor={interactive ? "clique" : undefined}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.3, 16], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: transparent, preserveDrawingBuffer: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ambientLight intensity={0.12} />
        {/* key branca do lado da câmera, rim violeta por trás */}
        <directionalLight position={[5, 7, 9]} intensity={2.1} color="#fffaf3" />
        <directionalLight position={[-6, 3, -7]} intensity={1.1} color="#9c8bf2" />
        <Environment resolution={128} frames={1}>
          {/* estúdio: softboxes, sem baixar HDR da internet */}
          <Lightformer form="rect" intensity={2.2} position={[3, 5, 8]} scale={[7, 5, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={0.7} position={[-5, 1, -4]} scale={[4, 6, 1]} color="#c9bfff" />
          <Lightformer form="ring" intensity={0.8} position={[0, -4, 3]} scale={3} color="#5ee6d8" />
        </Environment>
        <Sculpture region={region} onSelect={onSelect} interactive={interactive} />
      </Canvas>
    </div>
  );
}
