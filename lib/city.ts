import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useCity = create<{ city: string; set: (c: string) => void }>()(persist((set) => ({ city: "chennai", set: (city) => set({ city }) }), { name: "cineverse-city" }));
