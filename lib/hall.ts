export type Cat = "royal" | "balcony" | "prime" | "classic";
export const CATS: Record<Cat, { label: string; price: number; color: string }> = {
  royal: { label: "Royal Recliner", price: 550, color: "#f5b942" },
  balcony: { label: "Balcony", price: 320, color: "#8b6cf0" },
  prime: { label: "Prime", price: 240, color: "#2fd8a4" },
  classic: { label: "Classic", price: 160, color: "#4a7cf0" },
};
export interface Seat {
  id: string; row: string; n: number; side: 0 | 1;
  x: number; y: number; z: number; cat: Cat; sold: boolean;
}
export const PER_SIDE = 7;
const GROUPS: { cat: Cat; rows: number }[] = [
  { cat: "classic", rows: 6 }, { cat: "prime", rows: 6 },
  { cat: "royal", rows: 2 }, { cat: "balcony", rows: 4 },
];
// seeded random: same seed -> same sold seats
const rng = (a: number) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export function generateHall(seed = 7): Seat[] {
  const r = rng(seed), out: Seat[] = [];
  let ri = 0;
  for (const g of GROUPS)
    for (let i = 0; i < g.rows; i++, ri++) {
      const bal = g.cat === "balcony";
      const z = 4 + ri + (bal ? 2 : 0);
      const y = bal ? 3 + (ri - 14) * 0.25 : ri * 0.1;
      for (let n = 0; n < PER_SIDE * 2; n++) {
        const side = n < PER_SIDE ? 0 : 1;
        const x = (n - (PER_SIDE * 2 - 1) / 2) * 0.65 + (side ? 0.6 : -0.6);
        const row = String.fromCharCode(65 + ri);
        out.push({ id: row + (n + 1), row, n, side, x, y, z, cat: g.cat, sold: r() < 0.28 });
      }
    }
  return out;
}
const SWEET_Z = 11;
/** "Best N seats": free, side by side, no aisle crossing, recliners in pairs; closest to centre + sweet-spot row. */
export function bestSeats(seats: Seat[], qty: number, cat?: Cat): string[] | null {
  const rows = new Map<string, Seat[]>();
  for (const s of seats) {
    if (cat && s.cat !== cat) continue;
    const a = rows.get(s.row);
    a ? a.push(s) : rows.set(s.row, [s]);
  }
  let best: string[] | null = null, bestScore = Infinity;
  for (const row of rows.values()) {
    row.sort((a, b) => a.n - b.n);
    for (let i = 0; i + qty <= row.length; i++) {
      const w = row.slice(i, i + qty);
      if (w.some((s) => s.sold || s.side !== w[0].side)) continue;
      if (w[0].cat === "royal" && (qty % 2 || (w[0].n - w[0].side * PER_SIDE) % 2)) continue;
      const cx = Math.abs(w.reduce((t, s) => t + s.x, 0) / qty);
      const score = cx * 1.2 + Math.abs(w[0].z - SWEET_Z) * (w[0].cat === "balcony" ? 0.5 : 1);
      if (score < bestScore) { bestScore = score; best = w.map((s) => s.id); }
    }
  }
  return best;
}
export const HALL = generateHall();
