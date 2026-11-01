"use client";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CATS, HALL } from "../lib/hall";
import { useQuality } from "../lib/quality";
import { useStore } from "../lib/store";
import { canvasTex, fabricBump } from "../lib/textures";

type Part = { geo: THREE.BufferGeometry; mat: THREE.Material; tint: boolean };
const SEAT_W = 0.58;   // a real model is scaled to this width (metres)
const SEAT_YAW = 0;    // set to Math.PI if your seat model faces away from the screen
const part = (w: number, h: number, d: number, r: number, x: number, y: number, z: number, rx = 0) => {
  const g = new RoundedBoxGeometry(w, h, d, 3, r);
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new THREE.Vector3(1, 1, 1)));
  return g;
};

export default function Seats() {
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const selected = useStore((s) => s.selected), toggle = useStore((s) => s.toggle), hi = useQuality((s) => s.q === "high");
  const procedural = useMemo<Part[]>(() => [
    { geo: mergeGeometries([part(0.5, 0.14, 0.5, 0.05, 0, 0.32, 0), part(0.5, 0.62, 0.12, 0.05, 0, 0.68, 0.23, 0.18)])!,
      mat: new THREE.MeshStandardMaterial({ roughness: 0.85, bumpMap: canvasTex(128, fabricBump(), [2, 2], false), bumpScale: 1.5 }), tint: true },
    { geo: mergeGeometries([part(0.05, 0.07, 0.46, 0.02, -0.28, 0.48, 0), part(0.05, 0.07, 0.46, 0.02, 0.28, 0.48, 0), part(0.12, 0.26, 0.3, 0.02, 0, 0.13, 0.05)])!,
      mat: new THREE.MeshStandardMaterial({ color: "#111114", roughness: 0.45, metalness: 0.5 }), tint: false },
  ], []);
  const [real, setReal] = useState<Part[] | null>(null);

  // Optional: drop a seat model at /public/models/seat.glb (meshopt/Draco-free or meshopt-compressed). Falls back to the procedural seat.
  useEffect(() => {
    const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load("/models/seat.glb", (gltf) => {
      gltf.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(gltf.scene), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const k = SEAT_W / Math.max(size.x, size.z);
      const fit = new THREE.Matrix4().makeScale(k, k, k).multiply(new THREE.Matrix4().makeRotationY(SEAT_YAW)).multiply(new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z));
      const out: Part[] = [];
      gltf.scene.traverse((o) => {
        const m = o as THREE.Mesh; if (!m.isMesh) return;
        const geo = m.geometry.clone(); geo.applyMatrix4(m.matrixWorld.clone().premultiply(fit));
        const mat = Array.isArray(m.material) ? m.material[0] : m.material;
        out.push({ geo, mat, tint: /fabric|cloth|cushion|seat|leather|upholster/i.test(mat.name) });
      });
      if (out.length) { if (!out.some((p) => p.tint)) out[0].tint = true; setReal(out); }
    }, undefined, () => {});
  }, []);
  const parts = real ?? procedural;

  useLayoutEffect(() => {
    const o = new THREE.Object3D(), c = new THREE.Color();
    parts.forEach((p, pi) => {
      const im = refs.current[pi]; if (!im) return;
      HALL.forEach((s, i) => {
        o.position.set(s.x, s.y, s.z); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
        if (p.tint) { c.set(s.sold ? "#26262a" : selected.includes(s.id) ? "#22e6b8" : CATS[s.cat].color); im.setColorAt(i, c); }
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    });
  }, [selected, parts]);

  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); const s = HALL[e.instanceId!]; if (s && !s.sold) toggle(s.id); };
  return (
    <>
      {parts.map((p, pi) => (
        <instancedMesh key={`${real ? "g" : "p"}${pi}`} ref={(el) => { refs.current[pi] = el; }} args={[p.geo, p.mat, HALL.length]}
          onClick={click} castShadow={hi && p.tint} receiveShadow />
      ))}
    </>
  );
}
