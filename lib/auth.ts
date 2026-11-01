import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface User { name: string; email: string; phone: string; city: string }
/** Demo auth: profile only, passwords are never stored. Real accounts + password checks arrive with the backend. */
export const useAuth = create<{ user: User | null; users: User[]; signUp: (u: User) => void; signIn: (email: string) => boolean; signOut: () => void }>()(persist((set, get) => ({
  user: null, users: [],
  signUp: (u) => set((s) => ({ users: [...s.users.filter((x) => x.email !== u.email), u], user: u })),
  signIn: (email) => { const u = get().users.find((x) => x.email === email.trim().toLowerCase()); if (u) set({ user: u }); return !!u; },
  signOut: () => set({ user: null }),
}), { name: "cineverse-user" }));
