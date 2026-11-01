"use client";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HALL, Seat } from "../lib/hall";
import { useStore } from "../lib/store";
import { canvasTex, carpet, fabricBump, noise } from "../lib/textures";

const ROWS: Seat[] = (() => { const m = new Map<string, Seat>(); HALL.forEach((s) => m.has(s.row) || m.set(s.row, s)); return [...m.values()]; })();

function Screen() {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let raf = 0;
    const v = document.createElement("video");
    Object.assign(v, { src: "/trailer.mp4", loop: true, muted: true, playsInline: true, crossOrigin: "anonymous" });
    const fallback = () => { // animated placeholder until /public/trailer.mp4 exists
      const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 576;
      const c = cv.getContext("2d")!, t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const loop = (ts: number) => {
        const g = c.createLinearGradient(0, 0, 1024, 576);
        g.addColorStop(0, `hsl(${(ts / 40) % 360},55%,38%)`); g.addColorStop(1, "#0a1020");
        c.fillStyle = g; c.fillRect(0, 0, 1024, 576);
        c.fillStyle = "#fff"; c.font = "bold 56px system-ui"; c.textAlign = "center";
        c.fillText("Put trailer.mp4 in /public", 512, 300); t.needsUpdate = true; raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop); setTex(t);
    };
    v.onerror = fallback;
    v.play().then(() => { const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace; setTex(t); }).catch(() => {});
    return () => { cancelAnimationFrame(raf); v.pause(); };
  }, []);
  return (
    <mesh position={[0, 3.6, 0.1]}>
      <planeGeometry args={[10, 5.6]} />
      <meshBasicMaterial map={tex} color={tex ? "#ffffff" : "#222"} toneMapped={false} />
    </mesh>
  );
}

function AisleLights() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const o = new THREE.Object3D(); let i = 0;
    ROWS.forEach((s) => [-1, 1].forEach((sd) => { o.position.set(sd * 0.5, s.y + 0.03, s.z - 0.4); o.updateMatrix(); ref.current.setMatrixAt(i++, o.matrix); }));
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, ROWS.length * 2]}>
      <boxGeometry args={[0.04, 0.03, 0.12]} /><meshBasicMaterial color="#ffb347" toneMapped={false} />
    </instancedMesh>
  );
}

export default function Hall() {
  const house = useStore((s) => s.house);
  const { carpetMap, fabric, wall } = useMemo(() => ({
    carpetMap: canvasTex(256, carpet(), [6, 1]),
    fabric: canvasTex(128, fabricBump(), [3, 3], false),
    wall: canvasTex(256, noise("#5b2a24", 30), [1, 1]),
  }), []);
  const target = useMemo(() => { const o = new THREE.Object3D(); o.position.set(0, 0, 14); return o; }, []);
  const z = Array.from({ length: 12 }, (_, i) => 2 + i * 2);
  return (
    <>
      {/* shell: floor, walls, ceiling */}
      <mesh position={[0, 4.5, 12]} receiveShadow>
        <boxGeometry args={[18, 9, 26]} /><meshStandardMaterial color="#2b1214" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* stepped, carpeted rows */}
      {ROWS.map((s) => {
        const bot = s.cat === "balcony" ? 2.75 : 0, h = s.y - bot + 0.02;
        return (
          <mesh key={s.row} position={[0, bot + h / 2, s.z]} receiveShadow castShadow>
            <boxGeometry args={[17.8, h, 1]} /><meshStandardMaterial map={carpetMap} bumpMap={fabric} bumpScale={2} roughness={1} />
          </mesh>
        );
      })}
      <mesh position={[0, 2.75, 20.5]} castShadow receiveShadow><boxGeometry args={[18, 0.3, 7]} /><meshStandardMaterial color="#1c0c0e" roughness={0.9} /></mesh>
      {/* acoustic wall panels + glow strips */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          {z.map((zz) => (
            <mesh key={zz} position={[sd * 8.85, 3.4, zz]} receiveShadow>
              <boxGeometry args={[0.2, 5, 1.4]} /><meshStandardMaterial map={wall} bumpMap={fabric} bumpScale={1.5} roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[sd * 8.9, 6.4, 12]}><boxGeometry args={[0.05, 0.08, 24]} /><meshBasicMaterial color="#ffb86b" toneMapped={false} /></mesh>
        </group>
      ))}
      {/* ceiling baffles */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, 8.5, 1 + i * 2.8]}><boxGeometry args={[17, 0.6, 0.25]} /><meshStandardMaterial color="#14090b" roughness={0.9} /></mesh>
      ))}
      {/* screen, masking, curtains, stage */}
      <mesh position={[0, 3.6, 0]}><boxGeometry args={[11, 6.2, 0.2]} /><meshStandardMaterial color="#050505" /></mesh>
      <Screen />
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 6.9, 3.4, 0.4]} castShadow>
          <boxGeometry args={[2.4, 6.8, 0.5]} /><meshStandardMaterial color="#7a1020" bumpMap={fabric} bumpScale={3} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 1.2]} receiveShadow castShadow><boxGeometry args={[14, 0.6, 2]} /><meshStandardMaterial color="#3a1618" roughness={0.6} /></mesh>
      <mesh position={[0, 0.62, 2.2]}><boxGeometry args={[14, 0.03, 0.04]} /><meshBasicMaterial color="#2cf5c8" toneMapped={false} /></mesh>
      <mesh position={[-8.75, 2.2, 22.5]}><boxGeometry args={[0.05, 0.3, 0.7]} /><meshBasicMaterial color="#27e36b" toneMapped={false} /></mesh>
      <AisleLights />

      {/* lighting: dim cinema by default, warm house lights on demand */}
      <ambientLight intensity={house ? 0.8 : 0.1} color="#ffe3c2" />
      <primitive object={target} />
      <spotLight position={[0, 6, 2]} target={target} angle={0.9} penumbra={1} intensity={house ? 0 : 320} color="#9ec9ff" castShadow shadow-mapSize={[1024, 1024]} />
      {[6, 14, 21].map((zz) => <pointLight key={zz} position={[0, 8, zz]} intensity={house ? 140 : 0} color="#ffd9a0" />)}
      <Environment resolution={128} environmentIntensity={house ? 0.5 : 0.35}>
        <Lightformer form="rect" intensity={2.5} position={[0, 3.6, -2]} scale={[10, 5, 1]} color="#9ec9ff" />
        <Lightformer form="rect" intensity={0.6} position={[0, 8, 12]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#ffd9a0" />
      </Environment>
    </>
  );
}
