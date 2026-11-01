"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useNarrow, useQuality } from "../lib/quality";
import { useRouter } from "next/navigation";
import { useBooking } from "../lib/booking";
import { CATS, HALL, bestSeats } from "../lib/hall";
import { Preset, useStore } from "../lib/store";
import Hall from "./Hall";
import Seats from "./Seats";

const FPS = typeof window !== "undefined" && location.search.includes("fps"); // add ?fps to the URL
const BY_ID = new Map(HALL.map((s) => [s.id, s]));
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Shot = [THREE.Vector3, THREE.Vector3];
const PRESETS: Record<"overview" | "stage" | "balcony" | "bird", Shot> = {
  overview: [V(0, 6.5, 22), V(0, 2.5, 0)],
  stage: [V(0, 1.8, 1.5), V(0, 2.5, 14)],
  balcony: [V(0, 5.2, 20), V(0, 3, 0)],
  bird: [V(0, 7.4, 12), V(0, 0, 10)],
};
const TOUR: Shot[] = [PRESETS.overview, [V(-6, 5, 18), V(0, 3, 0)], PRESETS.stage, [V(6, 4, 10), V(0, 2, 4)], PRESETS.bird, PRESETS.balcony];
// camera can never leave this box -> never goes through walls, ceiling or floor
const MIN = V(-8.4, 0.6, 1), MAX = V(8.4, 7.4, 23.5);

function Rig() {
  const { camera } = useThree();
  const controls = useRef<any>(null);
  const preset = useStore((s) => s.preset), selected = useStore((s) => s.selected);
  const g = useRef({ p: PRESETS.overview[0].clone(), l: PRESETS.overview[1].clone(), fly: true, idx: 0, hold: 0 });

  useEffect(() => {
    const k = g.current;
    if (preset === "free") return;
    if (preset === "tour") { k.idx = 0; k.p.copy(TOUR[0][0]); k.l.copy(TOUR[0][1]); }
    else if (preset === "seat") {
      const s = BY_ID.get(selected[selected.length - 1] ?? "");
      if (!s) return;
      k.p.set(s.x, s.y + 1.05, s.z + 0.1); k.l.set(0, 3.5, 0);
    } else { k.p.copy(PRESETS[preset][0]); k.l.copy(PRESETS[preset][1]); }
    k.fly = true;
  }, [preset, selected]);

  useFrame((st) => {
    const c = controls.current, k = g.current;
    if (!c) return;
    const tour = useStore.getState().preset === "tour";
    if (k.fly) { // straight-line move: curved paths cut through walls
      const f = tour ? 0.025 : 0.08;
      camera.position.lerp(k.p, f); c.target.lerp(k.l, f);
      if (camera.position.distanceTo(k.p) < 0.08) { k.fly = false; k.hold = st.clock.elapsedTime + 1.2; }
    } else if (tour && st.clock.elapsedTime > k.hold) {
      k.idx = (k.idx + 1) % TOUR.length; k.p.copy(TOUR[k.idx][0]); k.l.copy(TOUR[k.idx][1]); k.fly = true;
    }
    camera.position.clamp(MIN, MAX);
    c.update();
  });
  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={1} maxDistance={30}
    onStart={() => { g.current.fly = false; useStore.setState({ preset: "free" }); }} />;
}

const btn = (on?: boolean): React.CSSProperties => ({
  padding: "6px 14px", borderRadius: 99, border: "1px solid #ffffff22", cursor: "pointer",
  background: on ? "#fff" : "#0b0d12cc", color: on ? "#000" : "#fff", fontSize: 13,
});

export default function SeatPicker() {
  const { selected, preset, qty, house, set } = useStore();
  const router = useRouter();
  const q = useQuality((s) => s.q), setQ = useQuality((s) => s.set), narrow = useNarrow(), hi = q === "high";
  const ctrls = (<>
    <a href="/" style={{ ...btn(), textDecoration: "none" }}>← Home</a>
    <button style={btn(house)} onClick={() => set({ house: !house })}>House lights</button>
    <button style={btn()} onClick={() => setQ(hi ? "low" : "high")}>Quality: {hi ? "High" : "Low"}</button>
  </>);
  const next = () => {
    const q = new URLSearchParams(location.search);
    useBooking.getState().start({ movieId: q.get("movie") ?? "jailer2", showId: q.get("show") ?? "0-0", day: Number(q.get("day") ?? 0), seats: selected });
    router.push("/checkout");
  };
  const total = selected.reduce((t, id) => t + CATS[BY_ID.get(id)!.cat].price, 0);
  const tabs: [Preset, string][] = [["overview", "Overview"], ["stage", "From stage"], ["balcony", "Balcony"], ["bird", "Bird's eye"], ["tour", "Tour"]];
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Canvas key={q} flat shadows={hi ? "basic" : false} camera={{ position: [0, 6.5, 22], fov: narrow ? 70 : 55 }} dpr={hi ? [1, 1.5] : 1} gl={{ antialias: false }}>
        <Hall /><Seats /><Rig />
        {FPS && <Stats />}
        {hi && <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.85} />
          <Vignette offset={0.3} darkness={0.6} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>}
      </Canvas>
      <div style={{ position: "absolute", top: 12, left: 12, right: narrow ? 12 : "auto", display: "flex", gap: 8, flexWrap: "wrap", maxWidth: narrow ? "none" : "60vw" }}>
        {tabs.map(([k, l]) => <button key={k} style={btn(preset === k)} onClick={() => set({ preset: k })}>{l}</button>)}
        {narrow && ctrls}
      </div>
      {!narrow && <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8 }}>{ctrls}</div>}
      <div style={narrow ? { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "42vh", overflowY: "auto", padding: 14, borderRadius: "16px 16px 0 0", background: "#0b0d12f2", border: "1px solid #ffffff18" } : { position: "absolute", top: 16, right: 16, width: 280, padding: 16, borderRadius: 16, background: "#0b0d12ee", border: "1px solid #ffffff18" }}>
        {Object.values(CATS).map((c) => (
          <div key={c.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
            <span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: c.color, marginRight: 8 }} />{c.label}</span>
            <span>₹{c.price}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
          <button style={btn()} onClick={() => set({ qty: Math.max(1, qty - 1) })}>−</button>
          <span style={{ alignSelf: "center" }}>{qty}</span>
          <button style={btn()} onClick={() => set({ qty: Math.min(6, qty + 1) })}>+</button>
          <button style={{ ...btn(true), flex: 1 }} onClick={() => { const ids = bestSeats(HALL, qty); if (ids) set({ selected: ids }); }}>Best {qty} seats</button>
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, minHeight: 20 }}>{selected.join(", ") || "Click a seat or use Best seats"}</div>
        {selected.length > 0 && <button style={{ ...btn(), marginTop: 10, width: "100%" }} onClick={() => set({ preset: "seat" })}>View from my seat</button>}
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>₹{total}</div>
        <button disabled={!selected.length} onClick={next} style={{ ...btn(true), width: "100%", marginTop: 10, padding: 12, fontWeight: 700, background: selected.length ? "#f7b731" : "#333", color: selected.length ? "#000" : "#777" }}>Continue · Add snacks</button>
      </div>
    </div>
  );
}
