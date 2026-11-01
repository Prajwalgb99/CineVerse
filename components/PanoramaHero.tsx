"use client";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Stars, Stats } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useRouter } from "next/navigation";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MOVIES, Movie } from "../data/movies";

const N = MOVIES.length, STEP = (Math.PI * 2) / N, R = 9, PW = 2.6, PH = 3.9, FLOOR = -0.75, AUTO = 5.2;
const GOLD = "#f7b731";
const FPS = typeof window !== "undefined" && location.search.includes("fps"); // add ?fps to the URL
type St = { angle: number; vel: number; target: number | null; drag: boolean; last: number; x: number; idx: number };
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function posterTex(m: Movie) {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 768;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 768); g.addColorStop(0, m.color); g.addColorStop(1, "#05060a");
  c.fillStyle = g; c.fillRect(0, 0, 512, 768);
  const r = c.createRadialGradient(256, 300, 10, 256, 300, 260); r.addColorStop(0, "#ffffff66"); r.addColorStop(1, "#ffffff00");
  c.fillStyle = r; c.fillRect(0, 0, 512, 768);
  c.fillStyle = "#fff"; c.textAlign = "center";
  c.font = "bold 92px Impact, 'Arial Narrow', sans-serif"; c.fillText(m.title.toUpperCase(), 256, 650, 460);
  c.font = "28px system-ui"; c.fillStyle = "#ffffffcc"; c.fillText(m.lang, 256, 700, 460);
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

function Poster({ m, i, st, onPick }: { m: Movie; i: number; st: MutableRefObject<St>; onPick: (i: number) => void }) {
  const g = useRef<THREE.Group>(null!), mat = useRef<THREE.MeshBasicMaterial>(null!);
  const refl = useRef<THREE.MeshBasicMaterial>(null!), glow = useRef<THREE.MeshBasicMaterial>(null!);
  const [tex, setTex] = useState<THREE.Texture>(() => posterTex(m));
  useEffect(() => {
    new THREE.TextureLoader().load(`/posters/${m.id}.jpg`, (t) => { t.colorSpace = THREE.SRGBColorSpace; setTex(t); }, undefined, () => {});
  }, [m.id]);
  useFrame(() => {
    const th = wrap(i * STEP - st.current.angle);
    const near = Math.max(0, 1 - Math.abs(th) / STEP), sc = 1 + 0.28 * near;
    g.current.position.set(R * Math.sin(th), FLOOR + (PH / 2) * sc, -R * Math.cos(th));
    g.current.rotation.y = -th; // faces inward, towards the viewer
    g.current.scale.setScalar(sc);
    const b = 1 - 0.65 * Math.min(1, Math.abs(th) / 1.2); // side screens darker by angle
    mat.current.color.setScalar(b); refl.current.color.setScalar(b); glow.current.opacity = near;
  });
  return (
    <group ref={g}>
      <mesh position={[0, 0, -0.02]}><planeGeometry args={[PW + 0.18, PH + 0.18]} /><meshBasicMaterial ref={glow} color={GOLD} transparent toneMapped={false} /></mesh>
      <mesh onClick={(e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onPick(i); }}>
        <planeGeometry args={[PW, PH]} /><meshBasicMaterial ref={mat} map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, -PH, 0]} scale={[1, -1, 1]}>
        <planeGeometry args={[PW, PH]} />
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
    tint.current.set(MOVIES[idx].color).multiplyScalar(0.35); // sky follows the front poster
    bg.current.lerp(tint.current, 0.04); scene.background = bg.current;
  });
  return null;
}

const pill: React.CSSProperties = { padding: "8px 14px", borderRadius: 10, border: "1px solid #ffffff1f", background: "#ffffff10", color: "#fff", fontSize: 13, cursor: "pointer" };

export default function PanoramaHero() {
  const router = useRouter();
  const st = useRef<St>({ angle: 0, vel: 0, target: null, drag: false, last: 0, x: 0, idx: 0 });
  const bar = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);
  const m = MOVIES[idx];
  const go = (i: number) => router.push(`/movie/${MOVIES[i].id}`);
  const pick = (i: number) => {
    if (i === st.current.idx) return go(i);
    st.current.target = st.current.angle + wrap(i * STEP - st.current.angle); // side screen -> front
  };
  const nudge = (d: number) => { const k = st.current; k.vel = 0; k.target = Math.round(k.angle / STEP) * STEP + d * STEP; };

  useEffect(() => {
    const k = st.current;
    const move = (e: PointerEvent) => { if (!k.drag) return; const d = -(e.clientX - k.x) * 0.004; k.x = e.clientX; k.angle += d; k.vel = k.vel * 0.5 + d * 0.5; };
    const up = () => { k.drag = false; };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#05060a", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, touchAction: "none", cursor: "grab" }}
        onPointerDown={(e) => { const k = st.current; k.drag = true; k.vel = 0; k.target = null; k.x = e.clientX; }}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.4, 8], fov: 42 }} onCreated={({ camera }) => camera.lookAt(0, 1.1, -9)}>
          <Stars radius={70} depth={30} count={900} factor={3} fade />
          {MOVIES.map((mv, i) => <Poster key={mv.id} m={mv} i={i} st={st} onPick={pick} />)}
          <Physics st={st} setIdx={setIdx} bar={bar} />
          {FPS && <Stats />}
          <EffectComposer multisampling={0}><Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.9} /><Vignette offset={0.3} darkness={0.7} /></EffectComposer>
        </Canvas>
      </div>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: "#fff" }}>
        <nav style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 20, padding: "18px 5vw", flexWrap: "wrap" }}>
          <b style={{ fontFamily: "Impact, sans-serif", letterSpacing: 1, fontSize: 20 }}><span style={{ background: GOLD, color: "#000", borderRadius: 6, padding: "2px 7px", marginRight: 8 }}>▣</span>CINEVERSE</b>
          {["Movies", "Events", "Plays", "Sports"].map((l) => <span key={l} style={{ fontSize: 13, opacity: 0.8 }}>{l}</span>)}
          <span style={{ flex: 1 }} />
          <span style={{ ...pill, minWidth: 180, opacity: 0.7 }}>Search movies, theatres…</span>
          <span style={{ ...pill, cursor: "pointer" }} onClick={() => router.push("/tickets")}>My tickets</span><span style={pill}>Chennai ▾</span>
          <span style={{ ...pill, background: GOLD, color: "#000", fontWeight: 700, border: 0 }}>Sign in</span>
        </nav>
        <div style={{ textAlign: "center", marginTop: "2vh" }}>
          <div style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: "clamp(36px,6vw,64px)", letterSpacing: 2 }}>CINE<span style={{ color: GOLD }}>VERSE</span></div>
          <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.55 }}>DRAG TO EXPLORE · TAP A SCREEN TO BOOK</div>
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
