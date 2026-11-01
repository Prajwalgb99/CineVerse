import { create } from "zustand";
export type Preset = "overview" | "stage" | "balcony" | "bird" | "seat" | "tour" | "free";
interface S {
  selected: string[]; preset: Preset; qty: number; house: boolean;
  toggle: (id: string) => void;
  set: (p: Partial<S>) => void;
}
export const useStore = create<S>((set, get) => ({
  selected: [], preset: "overview", qty: 2, house: false,
  toggle: (id) => {
    const { selected, qty } = get();
    set({ selected: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id].slice(-qty) });
  },
  set: (p) => set(p),
}));
