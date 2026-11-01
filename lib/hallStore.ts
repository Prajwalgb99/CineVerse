import { create } from "zustand";
import { useBooking } from "./booking";
import { Seat, generateHall } from "./hall";
import { useCity } from "./city";
import { getShows } from "./shows";
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const mk = (hall: Seat[]) => ({ hall, byId: new Map(hall.map((s) => [s.id, s])) });
/** The hall for one show: layout from the theatre, sold seats from how full the show is + seats you already booked. */
export const useHall = create<{ hall: Seat[]; byId: Map<string, Seat>; key: string; load: (movie: string, show: string, day: number) => void }>((set) => ({
  ...mk(generateHall()), key: "",
  load: (movie, show, day) => {
    const city = useCity.getState().city, key = `${city}|${movie}|${show}|${day}`;
    const fill = getShows(movie, day, city).flatMap((t) => t.shows).find((s) => s.id === show)?.fill ?? 0.3;
    const booked = useBooking.getState().booked?.[key] ?? [];
    set({ key, ...mk(generateHall(hash(key), Number(show.split("-")[0]) || 0, 0.06 + fill * 0.6, booked)) });
  },
}));
