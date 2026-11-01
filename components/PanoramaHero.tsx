"use client";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars, Stats } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useRouter } from "next/navigation";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { cityById, moviesFor } from "../data/cities";
import { MOVIES, Movie } from "../data/movies";
import { useAuth } from "../lib/auth";
import { useCity } from "../lib/city";
import NavBar from "./NavBar";
import { useNarrow, useQuality } from "../lib/quality";


let ring: Movie[] = MOVIES, N = ring.length, STEP = (Math.PI * 2) / N, R = 9;
const SPACING = 3.7, PH = 3.9, FLOOR = -0.75, AUTO = 5.2;
const setRing = (list: Movie[]) => { ring = list; N = Math.max(list.length, 1); STEP = (Math.PI * 2) / N; R = N > 1 ? SPACING / (2 * Math.sin(Math.min(STEP, Math.PI - 0.01) / 2)) : 9; };
const GOLD = "#f7b731";
const FPS = typeof window !== "undefined" && location.search.includes("fps"); // add ?fps to the URL
type St = { angle: number; vel: number; target: number | null; drag: boolean; last: number; x: number; idx: number; wheel: number; wt: number; tap: { i: number; idx: number; t: number; x: number; y: number } | null };
const EXT = ["jpg", "webp", "png"];
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function posterTex(m: Movie) {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 640;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, m.color); g.addColorStop(1, "#05060a");
  c.fillStyle = g; c.fillRect(0, 0, 512, 640);
  const r = c.createRadialGradient(256, 300, 10, 256, 300, 260); r.addColorStop(0, "#ffffff66"); r.addColorStop(1, "#ffffff00");
  c.fillStyle = r; c.fillRect(0, 0, 512, 640);
  c.fillStyle = "#fff"; c.textAlign = "center";
  c.font = "bold 92px Impact, 'Arial Narrow', sans-serif"; c.fillText(m.title.toUpperCase(), 256, 540, 460);
  c.font = "28px system-ui"; c.fillStyle = "#ffffffcc"; c.fillText(m.lang, 256, 590, 460);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
let fadeTex: THREE.CanvasTexture | null = null; // reflection fade: bright at the floor line
const fade = () => {
  if (fadeTex) return fadeTex;
  const cv = document.createElement("canvas"); cv.width = 4; cv.height = 128;
  const c = cv.getContext("2d")!, g = c.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "#000"); g.addColorStop(1, "#fff"); c.fillStyle = g; c.fillRect(0, 0, 4, 128);
  return (fadeTex = new THREE.CanvasTexture(cv));
};


const tex = (draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const radial = (c: CanvasRenderingContext2D, stops: [number, string][]) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; return g; };
function labelTex(m: Movie) { // title + language/rating, drawn above each poster
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 128;
  const c = cv.getContext("2d")!; c.textAlign = "center"; c.fillStyle = "#fff"; c.shadowColor = "#000"; c.shadowBlur = 8;
  c.font = "64px Impact, 'Arial Narrow', sans-serif"; c.fillText(m.title.toUpperCase(), 256, 66, 490);
  c.shadowBlur = 0; c.fillStyle = "#ffffffb8"; c.font = "26px system-ui, sans-serif"; c.fillText(`${m.lang.split(" · ")[0]} · ★ ${m.rating}`, 256, 108, 490);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/** Fixed deep-black night scene: glowing planet, projector beam onto the front screen, floor glow, drifting sparkles. */
function Backdrop() {
  const t = useMemo(() => ({
    glow: tex((c) => { radial(c, [[0, "#ffffffcc"], [0.35, "#6fa8ffaa"], [1, "#0000"]]); c.fillRect(0, 0, 256, 256); }),
    planet: tex((c) => { radial(c, [[0, "#c9e4ff"], [0.5, "#3f86ff"], [1, "#0a1650"]]); c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); }),
    cone: tex((c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#bcd8ff70"); g.addColorStop(1, "#bcd8ff00"); c.fillStyle = g; c.beginPath(); c.moveTo(108, 0); c.lineTo(148, 0); c.lineTo(256, 256); c.lineTo(0, 256); c.closePath(); c.fill(); }),
    floor: tex((c) => { radial(c, [[0, "#ffd37a99"], [0.5, "#5f8dff33"], [1, "#0000"]]); c.fillRect(0, 0, 256, 256); }),
  }), []);
  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false } as const;
  return (
    <>
      <mesh position={[0, 11.5, -R - 6]}><planeGeometry args={[36, 36]} /><meshBasicMaterial map={t.glow} {...add} opacity={0.5} /></mesh>
      <mesh position={[0, 11.5, -R - 5]}><planeGeometry args={[11, 11]} /><meshBasicMaterial map={t.planet} transparent toneMapped={false} /></mesh>
      <mesh position={[0, 4.4, -R - 0.6]}><planeGeometry args={[11, 13]} /><meshBasicMaterial map={t.cone} {...add} /></mesh>
      <mesh position={[0, FLOOR + 0.02, -R + 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[11, 6]} /><meshBasicMaterial map={t.floor} {...add} /></mesh>
      <Sparkles count={70} scale={[26, 9, 8]} position={[0, 3, -R + 2]} size={2.5} speed={0.25} opacity={0.6} color="#9ec9ff" />
    </>
  );
}

function Poster({ m, i, st, onPick }: { m: Movie; i: number; st: MutableRefObject<St>; onPick: (i: number, was: number) => void }) {
  const g = useRef<THREE.Group>(null!), mat = useRef<THREE.MeshBasicMaterial>(null!);
  const refl = useRef<THREE.MeshBasicMaterial>(null!), glow = useRef<THREE.MeshBasicMaterial>(null!), lab = useRef<THREE.MeshBasicMaterial>(null!);
  const labelT = useMemo(() => labelTex(m), [m]);
  const [tex, setTex] = useState<THREE.Texture>(() => posterTex(m));
  const [asp, setAsp] = useState(0.8); // plane shape follows the image (800x1000 = 0.8)
  useEffect(() => {
    const tryExt = (n: number) => { if (n >= EXT.length) return; new THREE.TextureLoader().load(`/posters/${m.id}.${EXT[n]}`, (t) => { t.colorSpace = THREE.SRGBColorSpace; setAsp(Math.max(0.6, Math.min(0.9, t.image.width / t.image.height))); setTex(t); }, undefined, () => tryExt(n + 1)); };
    tryExt(0);
  }, [m.id]);
  useFrame(() => {
    const th = wrap(i * STEP - st.current.angle);
    const near = Math.max(0, 1 - Math.abs(th) / STEP), sc = 1 + 0.28 * near;
    g.current.position.set(R * Math.sin(th), FLOOR + (PH / 2) * sc, -R * Math.cos(th));
    g.current.rotation.y = -th; // faces inward, towards the viewer
    g.current.scale.setScalar(sc);
    const b = 1 - 0.65 * Math.min(1, Math.abs(th) / (STEP * 2.3)); // side screens darker by angle
    mat.current.color.setScalar(b); refl.current.color.setScalar(b); glow.current.opacity = near; lab.current.color.setScalar(b);
  });
  return (
    <group ref={g}>
      <mesh position={[0, PH / 2 + 0.5, 0]}><planeGeometry args={[3.4, 0.85]} /><meshBasicMaterial ref={lab} map={labelT} transparent toneMapped={false} depthWrite={false} /></mesh>
      <mesh position={[0, 0, -0.02]}><planeGeometry args={[PH * asp + 0.18, PH + 0.18]} /><meshBasicMaterial ref={glow} color={GOLD} transparent toneMapped={false} /></mesh>
      <mesh
        onPointerDown={(e) => { st.current.tap = { i, idx: st.current.idx, t: performance.now(), x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }; }}
        onClick={(e: ThreeEvent<MouseEvent>) => { // only a quick, still tap opens a movie
          const t = st.current.tap; st.current.tap = null;
          if (!t || t.i !== i || performance.now() - t.t > 350 || Math.hypot(e.nativeEvent.clientX - t.x, e.nativeEvent.clientY - t.y) > 8) return;
          e.stopPropagation(); onPick(i, t.idx);
        }}>
        <planeGeometry args={[PH * asp, PH]} /><meshBasicMaterial ref={mat} map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, -PH, 0]} scale={[1, -1, 1]}>
        <planeGeometry args={[PH * asp, PH]} />
        <meshBasicMaterial ref={refl} map={tex} alphaMap={fade()} transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Physics({ st, setIdx, bar }: { st: MutableRefObject<St>; setIdx: (i: number) => void; bar: MutableRefObject<HTMLDivElement | null> }) {
  const { scene } = useThree();
  const bg = useRef(new THREE.Color("#05060a")), tint = useRef(new THREE.Color());
  useFrame((s) => {
    const k = st.current, t = s.clock.elapsedTime;
    if (k.drag) k.last = t;
    else if (k.target !== null) { // glide to target
      k.angle += (k.target - k.angle) * 0.09;
      if (Math.abs(k.target - k.angle) < 0.0008) { k.angle = k.target; k.target = null; k.last = t; }
    } else if (Math.abs(k.vel) > 0.0008) { k.angle += k.vel; k.vel *= 0.94; } // friction
    else {
      k.vel = 0;
      const a = Math.round(k.angle / STEP) * STEP; // snap to nearest screen
      if (Math.abs(a - k.angle) > 0.002) k.target = a;
      else if (t - k.last > AUTO) k.target = k.angle + STEP; // auto-advance
    }
    if (bar.current) bar.current.style.width = (k.drag || k.target !== null ? 0 : Math.min(1, (t - k.last) / AUTO) * 100) + "%";
    const idx = ((Math.round(k.angle / STEP) % N) + N) % N;
    if (idx !== k.idx) { k.idx = idx; setIdx(idx); }
    
  });
  return null;
}

const pill: React.CSSProperties = { padding: "8px 14px", borderRadius: 10, border: "1px solid #ffffff1f", background: "#ffffff10", color: "#fff", fontSize: 13, cursor: "pointer" };

export default function PanoramaHero() {
  const router = useRouter();
  const cityId = useCity((s) => s.city), user = useAuth((s) => s.user), signOut = useAuth((s) => s.signOut);
  setRing(moviesFor(cityById(cityId))); // the ring shows this city's movies
  const q = useQuality((s) => s.q), setQ = useQuality((s) => s.set), narrow = useNarrow(), hi = q === "high";
  const st = useRef<St>({ angle: 0, vel: 0, target: null, drag: false, last: 0, x: 0, idx: 0, wheel: 0, wt: 0, tap: null });
  const bar = useRef<HTMLDivElement | null>(null), root = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(true); // stop drawing the 3D ring while it is scrolled out of view
  useEffect(() => { const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting)); io.observe(root.current!); return () => io.disconnect(); }, []);
  const [idx, setIdx] = useState(0);
  useEffect(() => { Object.assign(st.current, { angle: 0, vel: 0, target: null, idx: 0 }); setIdx(0); }, [cityId]);
  const m = ring[idx] ?? ring[0];
  const go = (i: number) => router.push(`/movie/${ring[i].id}`);
  const pick = (i: number, was: number) => {
    if (i === was && i === st.current.idx) return go(i);
    st.current.target = st.current.angle + wrap(i * STEP - st.current.angle); // side screen -> front
  };
  const nudge = (d: number) => { const k = st.current; k.vel = 0; k.target = Math.round(k.angle / STEP) * STEP + d * STEP; };

  useEffect(() => {
    const k = st.current;
    const move = (e: PointerEvent) => { if (!k.drag) return; const d = -(e.clientX - k.x) * 0.007; k.x = e.clientX; k.angle += d; k.vel = k.vel * 0.5 + d * 0.5; };
    const up = () => { // flick: a quick swipe jumps up to 3 screens, then snaps
      if (!k.drag) return; k.drag = false;
      const proj = k.angle + Math.max(-3 * STEP, Math.min(3 * STEP, k.vel * 14));
      k.target = Math.round(proj / STEP) * STEP; k.vel = 0;
    };
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") nudge(1); else if (e.key === "ArrowLeft") nudge(-1); else if (e.key === "Enter" && document.activeElement === document.body) go(k.idx); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("keydown", key); };
  }, []);

  return (
    <div ref={root} style={{ position: "relative", height: "100svh", background: "#05060a", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, touchAction: "none", cursor: "grab" }}
        onWheel={(e) => { // trackpad / mouse wheel: one screen per notch
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical wheel scrolls the page
          const k = st.current, d = e.deltaX;
          k.wheel += d;
          if (Math.abs(k.wheel) > 50 && performance.now() - k.wt > 300) { nudge(k.wheel > 0 ? 1 : -1); k.wheel = 0; k.wt = performance.now(); }
        }}
        onPointerDown={(e) => { const k = st.current; k.drag = true; k.vel = 0; k.target = null; k.x = e.clientX; }}>
        <Canvas key={q + cityId} frameloop={vis ? "always" : "never"} dpr={hi ? [1, 1.5] : 1} camera={{ position: [0, 1.4, 17 - R], fov: narrow ? 72 : 42 }} onCreated={({ camera }) => camera.lookAt(0, 2.3, -R)}>
          <color attach="background" args={["#04050b"]} />
          <Backdrop />
          <Stars radius={70} depth={30} count={900} factor={3} fade />
          {ring.map((mv, i) => <Poster key={mv.id} m={mv} i={i} st={st} onPick={pick} />)}
          <Physics st={st} setIdx={setIdx} bar={bar} />
          {FPS && <Stats />}
          {hi && <EffectComposer multisampling={0}><Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.9} /><Vignette offset={0.3} darkness={0.7} /></EffectComposer>}
        </Canvas>
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: "#fff" }}>
        <NavBar narrow={narrow} hi={hi} onQuality={() => setQ(hi ? "low" : "high")} />
        <div style={{ textAlign: "center", marginTop: "2vh" }}>
          <div style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: "clamp(30px,4.4vw,50px)", letterSpacing: 2 }}>CINE<span style={{ color: GOLD }}>VERSE</span></div>
          <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.55 }}>SWIPE OR DRAG TO BROWSE · TAP A SCREEN TO OPEN</div>
        </div>
        <div style={{ position: "absolute", bottom: "4vh", left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, pointerEvents: "auto" }}>
          <button style={{ ...pill, borderRadius: 99, width: 40, height: 40 }} onClick={() => nudge(-1)}>‹</button>
          <div style={{ position: "relative", background: "#0b0d12ee", border: "1px solid #ffffff1c", borderRadius: 16, padding: "14px 20px", display: "flex", alignItems: "center", gap: 18, minWidth: "min(560px,70vw)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}><span style={{ color: GOLD }}>●</span> {m.status.toUpperCase()}</div>
              <div style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: 30, letterSpacing: 1 }}>{m.title.toUpperCase()}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{m.cert} · {m.lang} · {m.genre} · {m.dur} · <span style={{ color: GOLD }}>★ {m.rating}</span></div>
            </div>
            <button style={{ ...pill, borderRadius: 99 }} onClick={() => go(idx)}>▶ Trailer</button>
            <button style={{ ...pill, borderRadius: 99, background: GOLD, color: "#000", fontWeight: 700, border: 0 }} onClick={() => go(idx)}>{m.status === "Pre-booking open" ? "Pre-book" : "Book tickets"}</button>
            <div style={{ position: "absolute", left: 16, right: 16, bottom: 0, height: 2, background: "#ffffff18" }}><div ref={bar} style={{ height: 2, background: GOLD, width: 0 }} /></div>
          </div>
          <button style={{ ...pill, borderRadius: 99, width: 40, height: 40 }} onClick={() => nudge(1)}>›</button>
        </div>
        <div style={{ position: "absolute", bottom: "17vh", right: "5vw", fontSize: 11, letterSpacing: 2, opacity: 0.6 }}>{String(idx + 1).padStart(2, "0")} / {N}</div>
      </div>
    </div>
  );
}
