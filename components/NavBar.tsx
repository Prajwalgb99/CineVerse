"use client";
import { useRouter } from "next/navigation";
import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { cityById, moviesFor } from "../data/cities";
import { useAuth } from "../lib/auth";
import { useHydrated } from "../lib/booking";
import { useCity } from "../lib/city";
import CitySelect from "./CitySelect";

const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif";
const Ico = ({ children, size = 16 }: { children: ReactNode; size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
const glass: CSSProperties = { background: "#ffffff0f", border: "1px solid #ffffff1f", borderRadius: 12, color: "#fff", cursor: "pointer", fontSize: 13 };

export default function NavBar({ narrow, hi, onQuality }: { narrow: boolean; hi: boolean; onQuality: () => void }) {
  const router = useRouter(), user = useAuth((s) => s.user), signOut = useAuth((s) => s.signOut);
  const ready = useHydrated(), cityId = useCity((s) => s.city), city = cityById(ready ? cityId : "chennai");
  const [q, setQ] = useState(""), [focus, setFocus] = useState(false), [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const f = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) { setFocus(false); setMenu(false); } }; window.addEventListener("pointerdown", f); return () => window.removeEventListener("pointerdown", f); }, []);
  const results = useMemo(() => (q.trim() ? moviesFor(city).filter((m) => m.title.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : []), [q, city]);
  const open = (id: string) => { setQ(""); setFocus(false); router.push(`/movie/${id}`); };
  const link = (label: string, onClick?: () => void) => <span key={label} onClick={onClick} title={onClick ? "" : "Coming soon"} style={{ fontSize: 13, fontWeight: 600, opacity: onClick ? 0.9 : 0.55, cursor: "pointer", padding: "6px 2px" }}>{label}</span>;
  return (
    <nav ref={box} style={{ pointerEvents: "auto", position: "relative", zIndex: 30, margin: "14px 3vw 0", padding: "8px 12px", display: "flex", alignItems: "center", gap: narrow ? 8 : 18, borderRadius: 18, background: "#080a10b0", border: "1px solid #ffffff14", backdropFilter: "blur(14px)" }}>
      <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(145deg,${GOLD},#ffcf5a)`, color: "#000", display: "grid", placeItems: "center" }}><Ico><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></Ico></span>
        {!narrow && <b style={{ fontFamily: HEAD, letterSpacing: 1, fontSize: 19 }}>CINEVERSE</b>}
      </div>
      {!narrow && <div style={{ display: "flex", gap: 18 }}>{link("Movies", () => document.getElementById("now-showing")?.scrollIntoView({ behavior: "smooth" }))}{link("Events")}{link("Plays")}{link("Sports")}</div>}
      <span style={{ flex: 1 }} />
      {!narrow && (
        <div style={{ position: "relative", width: focus ? 300 : 230, transition: "width .2s" }}>
          <span style={{ position: "absolute", left: 12, top: 10, opacity: 0.6 }}><Ico size={15}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Ico></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onKeyDown={(e) => e.key === "Enter" && results[0] && open(results[0].id)} placeholder={`Search movies in ${city.name}`}
            style={{ ...glass, width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 36px", outline: "none", cursor: "text" }} />
          {focus && results.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#0a0c12f7", border: "1px solid #ffffff22", borderRadius: 14, padding: 6, boxShadow: "0 18px 40px #000c" }}>
              {results.map((m) => <div key={m.id} onClick={() => open(m.id)} style={{ padding: "8px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13, display: "flex", justifyContent: "space-between", gap: 10 }}><b style={{ fontWeight: 600 }}>{m.title}</b><span style={{ opacity: 0.5, fontSize: 11 }}>{m.lang.split(" · ")[0]}</span></div>)}
            </div>
          )}
        </div>
      )}
      <button onClick={() => router.push("/tickets")} aria-label="My tickets" style={{ ...glass, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontWeight: 600 }}>
        <Ico><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3v3z" /><path d="M13 6v12" strokeDasharray="2 2.5" /></Ico>{!narrow && "My tickets"}
      </button>
      <CitySelect />
      <button onClick={onQuality} title={`Graphics: ${hi ? "High" : "Low"} (tap to change)`} aria-label="Graphics quality" style={{ ...glass, width: 38, height: 38, display: "grid", placeItems: "center", color: hi ? GOLD : "#ffffff99" }}><Ico><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Ico></button>
      {user ? (
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenu(!menu)} style={{ ...glass, display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 4px" }}>
            <span style={{ width: 30, height: 30, borderRadius: 99, background: `linear-gradient(145deg,${GOLD},#ff9d4d)`, color: "#000", fontWeight: 800, display: "grid", placeItems: "center" }}>{user.name[0]?.toUpperCase()}</span>
            {!narrow && <span style={{ fontWeight: 600 }}>{user.name.split(" ")[0]}</span>}
          </button>
          {menu && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: 190, background: "#0a0c12f7", border: "1px solid #ffffff22", borderRadius: 14, padding: 6, boxShadow: "0 18px 40px #000c" }}>
              <div style={{ padding: "8px 10px", fontSize: 12, opacity: 0.6, borderBottom: "1px solid #ffffff14", marginBottom: 4 }}>{user.email}</div>
              <div onClick={() => router.push("/tickets")} style={{ padding: "9px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>My tickets</div>
              <div onClick={() => { signOut(); setMenu(false); }} style={{ padding: "9px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13, color: "#ff8a93" }}>Sign out</div>
            </div>
          )}
        </div>
      ) : (
        <>
          {!narrow && <button onClick={() => router.push("/login")} style={{ ...glass, padding: "9px 14px", fontWeight: 600 }}>Sign in</button>}
          <button onClick={() => router.push("/signup")} style={{ ...glass, background: `linear-gradient(90deg,${GOLD},#ffd56b)`, color: "#000", border: 0, padding: "9px 16px", fontWeight: 800 }}>Sign up</button>
        </>
      )}
    </nav>
  );
}
