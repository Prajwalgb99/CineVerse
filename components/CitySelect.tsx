"use client";
import { useEffect, useRef, useState } from "react";
import { CITIES, cityById } from "../data/cities";
import { useHydrated } from "../lib/booking";
import { useCity } from "../lib/city";
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
      <button onClick={() => setOpen(!open)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ffffff1f", background: "#ffffff10", color: "#fff", fontSize: 13, cursor: "pointer" }}>📍 {cur.name} ▾</button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 180, background: "#0b0d12f5", border: "1px solid #ffffff22", borderRadius: 12, padding: 6, boxShadow: "0 12px 30px #000a" }}>
          {CITIES.map((c) => (
            <button key={c.id} onClick={() => { set(c.id); setOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", border: 0, borderRadius: 8, cursor: "pointer", fontSize: 13, background: c.id === cur.id ? "#f7b73126" : "transparent", color: c.id === cur.id ? "#f7b731" : "#fff" }}>{c.name}</button>
          ))}
        </div>
      )}
    </div>
  );
}
