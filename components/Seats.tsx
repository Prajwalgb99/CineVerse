"use client";
import { ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CATS, HALL } from "../lib/hall";
import { useStore } from "../lib/store";
import { canvasTex, fabricBump } from "../lib/textures";

const part = (w: number, h: number, d: number, r: number, x: number, y: number, z: number, rx = 0) => {
  const g = new RoundedBoxGeometry(w, h, d, 3, r);
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new THREE.Vector3(1, 1, 1)));
  return g;
};

export default function Seats() {
  const fab = useRef<THREE.InstancedMesh>(null!), frm = useRef<THREE.InstancedMesh>(null!);
  const selected = useStore((s) => s.selected), toggle = useStore((s) => s.toggle);
  const { fabricGeo, frameGeo, bump } = useMemo(() => ({
    // seat faces -z (the screen); backrest sits at +z, leaning back
    fabricGeo: mergeGeometries([part(0.5, 0.14, 0.5, 0.05, 0, 0.32, 0), part(0.5, 0.62, 0.12, 0.05, 0, 0.68, 0.23, 0.18)])!,
    frameGeo: mergeGeometries([part(0.05, 0.07, 0.46, 0.02, -0.28, 0.48, 0), part(0.05, 0.07, 0.46, 0.02, 0.28, 0.48, 0),
      part(0.12, 0.26, 0.3, 0.02, 0, 0.13, 0.05)])!,
    bump: canvasTex(128, fabricBump(), [2, 2], false),
  }), []);

  useLayoutEffect(() => {
    const o = new THREE.Object3D(), c = new THREE.Color();
    HALL.forEach((s, i) => {
      o.position.set(s.x, s.y, s.z); o.updateMatrix();
      fab.current.setMatrixAt(i, o.matrix); frm.current.setMatrixAt(i, o.matrix);
      c.set(s.sold ? "#26262a" : selected.includes(s.id) ? "#22e6b8" : CATS[s.cat].color);
      fab.current.setColorAt(i, c);
    });
    fab.current.instanceMatrix.needsUpdate = true; frm.current.instanceMatrix.needsUpdate = true;
    fab.current.instanceColor!.needsUpdate = true;
  }, [selected]);

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const s = HALL[e.instanceId!];
    if (s && !s.sold) toggle(s.id);
  };
  return (
    <>
      <instancedMesh ref={fab} args={[fabricGeo, undefined, HALL.length]} onClick={click} castShadow receiveShadow>
        <meshStandardMaterial roughness={0.85} bumpMap={bump} bumpScale={1.5} />
      </instancedMesh>
      <instancedMesh ref={frm} args={[frameGeo, undefined, HALL.length]} onClick={click} receiveShadow>
        <meshStandardMaterial color="#111114" roughness={0.45} metalness={0.5} />
      </instancedMesh>
    </>
  );
}
