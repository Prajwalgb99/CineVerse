import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
type Q = "low" | "high";
/** Phones/tablets (touch) start on Low; the choice is remembered. */
export const useQuality = create<{ q: Q; set: (q: Q) => void }>()(persist((set) => ({
  q: typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? "low" : "high",
  set: (q) => set({ q }),
}), { name: "cineverse-quality" }));
export const useNarrow = () => {
  const [n, setN] = useState(false);
  useEffect(() => { const f = () => setN(window.innerWidth < 720); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return n;
};
