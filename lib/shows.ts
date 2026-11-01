export interface Show { id: string; time: string; hour: number; fmt: string; fill: number; price: number }
export interface Theatre { id: string; name: string; area: string; dist: number; shows: Show[] }
const THEATRES = [["Luxe Cinemas", "Velachery", 2.1], ["SPI Sathyam", "Royapettah", 4.8], ["PVR Grand Galada", "Pallavaram", 6.3], ["AGS Cinemas", "OMR", 7.9], ["Kamala Cinemas", "Vadapalani", 9.4]] as const;
const FORMATS = ["2D", "2D", "IMAX", "4DX", "Dolby Atmos"];
const PRICE: Record<string, number> = { "2D": 200, IMAX: 420, "4DX": 380, "Dolby Atmos": 340 };
const SLOTS = [10.25, 13.5, 16.75, 19.5, 22.75];
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (a: number) => () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const fmtTime = (t: number) => { const h = Math.floor(t), m = Math.round((t - h) * 60); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

/** Demo data: same movie + day -> same result. Replace with the real API later. */
export function getShows(movieId: string, day: number): Theatre[] {
  return THEATRES.map(([name, area, dist], ti) => {
    const r = rng(hash(`${movieId}|${name}|${day}`));
    const shows = SLOTS.filter(() => r() > 0.2).map((t, i) => {
      const fmt = FORMATS[Math.floor(r() * FORMATS.length)], evening = t >= 18 && t <= 21;
      const fill = Math.max(0.05, Math.min(0.98, 0.12 + (i / 5) * 0.3 + (evening ? 0.25 : 0) + r() * 0.3 - day * 0.04));
      return { id: `${ti}-${i}`, time: fmtTime(t), hour: t, fmt, fill, price: PRICE[fmt] };
    });
    return { id: String(ti), name, area, dist, shows };
  }).filter((t) => t.shows.length).sort((a, b) => a.dist - b.dist);
}
export const fillLabel = (f: number) => (f > 0.85 ? ["Almost full", "#ef4444"] : f > 0.6 ? ["Filling fast", "#f7b731"] : ["Available", "#2fd8a4"]) as [string, string];
