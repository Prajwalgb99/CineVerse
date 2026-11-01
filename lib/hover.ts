import { create } from "zustand";
export const useHover = create<{ id: string | null; x: number; y: number; set: (id: string | null, x: number, y: number) => void }>((set) => ({
  id: null, x: 0, y: 0, set: (id, x, y) => set({ id, x, y }),
}));
