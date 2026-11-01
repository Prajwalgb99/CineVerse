"use client";
import { useEffect, useRef, useState } from "react";
import { CITIES, cityById } from "../data/cities";
import { useHydrated } from "../lib/booking";
import { useCity } from "../lib/city";
const Pin = ({ c = "#f7b731" }: { c?: string }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>;
export default function CitySelect() {
  const ready = useHydrated(), id = useCity((s) => s.city), set = useCity((s) => s.set);
  const [open, setOpen] = useState(false), box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("pointerdown", f); return () => window.removeEventListener("pointerdown", f);
  }, []);
  const cur = cityById(ready ? id : "chennai");
  return (
    <div ref={box} style={{ position: "relative", pointerEvents: "auto", zIndex: 20 }}>
      <button onClick={() => setOpen(!open)} aria-label="Select city" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, border: "1px solid #ffffff1f", background: "#ffffff0f", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <Pin /><span>{cur.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: 230, background: "#0a0c12f7", border: "1px solid #ffffff22", borderRadius: 14, padding: 6, boxShadow: "0 18px 40px #000c" }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.5, padding: "8px 10px 4px" }}>SELECT YOUR CITY</div>
          {CITIES.map((c) => (
            <button key={c.id} onClick={() => { set(c.id); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 10px", border: 0, borderRadius: 9, cursor: "pointer", fontSize: 13, background: c.id === cur.id ? "#f7b73122" : "transparent", color: c.id === cur.id ? "#f7b731" : "#fff" }}>
              <Pin c={c.id === cur.id ? "#f7b731" : "#ffffff77"} /><span style={{ flex: 1 }}>{c.name}</span><span style={{ fontSize: 11, opacity: 0.5 }}>{c.home}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
