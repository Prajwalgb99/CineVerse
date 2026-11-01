import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Ticket { id: string; movieId: string; title: string; theatre: string; area: string; time: string; fmt: string; date: string; seats: string[]; snacks: string[]; total: number }
interface B {
  movieId: string; showId: string; day: number; seats: string[]; cart: Record<string, number>; tickets: Ticket[];
  start: (p: { movieId: string; showId: string; day: number; seats: string[] }) => void;
  add: (id: string, d: number) => void;
  confirm: (t: Ticket) => void;
}
export const useBooking = create<B>()(persist((set) => ({
  movieId: "", showId: "", day: 0, seats: [], cart: {}, tickets: [],
  start: (p) => set({ ...p, cart: {} }),
  add: (id, d) => set((s) => { const n = Math.max(0, (s.cart[id] ?? 0) + d), c = { ...s.cart }; if (n) c[id] = n; else delete c[id]; return { cart: c }; }),
  confirm: (t) => set((s) => ({ tickets: [t, ...s.tickets], seats: [], cart: {} })),
}), { name: "cineverse-booking" }));

export const SNACKS = [
  { id: "pop-l", name: "Salted popcorn · Large", price: 320, icon: "🍿" },
  { id: "pop-c", name: "Caramel popcorn", price: 360, icon: "🍿" },
  { id: "nachos", name: "Nachos with cheese", price: 280, icon: "🌮" },
  { id: "samosa", name: "Samosa (2)", price: 120, icon: "🥟" },
  { id: "coke", name: "Cola · 500 ml", price: 150, icon: "🥤" },
  { id: "brownie", name: "Choco brownie", price: 180, icon: "🍫" },
  { id: "combo", name: "Combo · popcorn + 2 colas", price: 520, icon: "🎬" },
  { id: "water", name: "Water bottle", price: 40, icon: "💧" },
];
/** persisted state is only readable in the browser, so pages wait for this */
export const useHydrated = () => { const [h, set] = useState(false); useEffect(() => set(true), []); return h; };
