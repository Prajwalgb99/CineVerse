export type Cat = "royal" | "balcony" | "prime" | "classic";
export const CATS: Record<Cat, { label: string; price: number; color: string }> = {
  royal: { label: "Royal Recliner", price: 550, color: "#f5b942" },
  balcony: { label: "Balcony", price: 320, color: "#8b6cf0" },
  prime: { label: "Prime", price: 240, color: "#2fd8a4" },
  classic: { label: "Classic", price: 160, color: "#4a7cf0" },
};
export interface Seat { id: string; row: string; n: number; ln: number; side: 0 | 1; x: number; y: number; z: number; cat: Cat; sold: boolean }
export const PER_SIDE = 7;
// One layout per theatre (picked from the show id): [category, rows], seats per side
const LAYOUTS: { side: number; g: [Cat, number][] }[] = [
  { side: 7, g: [["classic", 6], ["prime", 6], ["royal", 2], ["balcony", 4]] },
  { side: 8, g: [["classic", 5], ["prime", 5], ["royal", 3], ["balcony", 4]] },
  { side: 6, g: [["classic", 4], ["prime", 6], ["royal", 2], ["balcony", 4]] },
  { side: 7, g: [["classic", 6], ["prime", 5], ["royal", 2], ["balcony", 3]] },
  { side: 8, g: [["classic", 6], ["prime", 7], ["royal", 0], ["balcony", 4]] },
];
const rng = (a: number) => () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
/** same seed -> same sold seats. `extraSold` = seats booked by the user on this show. */
export function generateHall(seed = 7, layout = 0, pSold = 0.28, extraSold: string[] = []): Seat[] {
  const L = LAYOUTS[layout % LAYOUTS.length], S = L.side, r = rng(seed), out: Seat[] = [];
  const floorRows = L.g.filter(([c]) => c !== "balcony").reduce((t, [, n]) => t + n, 0);
  let ri = 0;
  for (const [cat, rows] of L.g)
    for (let i = 0; i < rows; i++, ri++) {
      const bal = cat === "balcony", bi = ri - floorRows;
      const z = bal ? 20 + bi : 4 + ri, y = bal ? 3 + bi * 0.25 : ri * 0.1, row = String.fromCharCode(65 + ri);
      for (let n = 0; n < S * 2; n++) {
        const side = n < S ? 0 : 1, id = row + (n + 1);
        const x = (n - (S * 2 - 1) / 2) * 0.65 + (side ? 0.6 : -0.6);
        const sold = r() < pSold || extraSold.includes(id);
        out.push({ id, row, n, ln: n - side * S, side, x, y, z, cat, sold });
      }
    }
  return out;
}
const SWEET_Z = 11;
/** "Best N seats": free, side by side, no aisle crossing, recliners in pairs; closest to centre + sweet-spot row. */
export function bestSeats(seats: Seat[], qty: number, cat?: Cat): string[] | null {
  const rows = new Map<string, Seat[]>();
  for (const s of seats) { if (cat && s.cat !== cat) continue; const a = rows.get(s.row); a ? a.push(s) : rows.set(s.row, [s]); }
  let best: string[] | null = null, bestScore = Infinity;
  for (const row of rows.values()) {
    row.sort((a, b) => a.n - b.n);
    for (let i = 0; i + qty <= row.length; i++) {
      const w = row.slice(i, i + qty);
      if (w.some((s) => s.sold || s.side !== w[0].side)) continue;
      if (w[0].cat === "royal" && (qty % 2 || w[0].ln % 2)) continue;
      const cx = Math.abs(w.reduce((t, s) => t + s.x, 0) / qty);
      const score = cx * 1.2 + Math.abs(w[0].z - SWEET_Z) * (w[0].cat === "balcony" ? 0.5 : 1);
      if (score < bestScore) { bestScore = score; best = w.map((s) => s.id); }
    }
  }
  return best;
}
export const HALL = generateHall();
