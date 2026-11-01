"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cityById, langsFor, moviesFor } from "../data/cities";
import { Movie } from "../data/movies";
import { useHydrated } from "../lib/booking";
import { useCity } from "../lib/city";

const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif";
const MARQUEE = "Your seat is waiting. ✦ Lights down. ✦ Phones off. ✦ Every format. IMAX · 4DX · Atmos. ✦ ";

const clip: React.CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
function Card({ m, rank }: { m: Movie; rank: number }) {
  const [img, setImg] = useState(true);
  return (
    <Link href={`/movie/${m.id}`} data-card draggable={false} style={{ flex: "0 0 240px", display: "flex", flexDirection: "column", borderRadius: 16, overflow: "hidden", color: "#fff", textDecoration: "none", background: "#0f1117", border: "1px solid #ffffff14", boxShadow: "0 18px 40px #000a", scrollSnapAlign: "start", willChange: "transform" }}>
      <div style={{ position: "relative", aspectRatio: "4 / 5", background: `linear-gradient(160deg, ${m.color}, #05060a)` }}>
        {img ? <img src={`/posters/${m.id}.jpg`} alt={m.title} draggable={false} onError={() => setImg(false)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: HEAD, fontSize: 110, opacity: 0.25 }}>{m.title[0]}</span>}
        <span style={{ position: "absolute", top: 10, left: 10, width: 28, height: 28, borderRadius: 99, background: "#000b", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{String(rank).padStart(2, "0")}</span>
        <span style={{ position: "absolute", top: 10, right: 10, background: "#000b", borderRadius: 99, padding: "4px 9px", fontSize: 11 }}><span style={{ color: "#ff4b55" }}>★</span> {m.rating}</span>
        <span style={{ position: "absolute", left: 10, bottom: 10, background: m.pan ? GOLD : "#000b", color: m.pan ? "#000" : "#fff", borderRadius: 99, padding: "3px 9px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{m.pan ? "PAN-INDIA" : `${m.lang.toUpperCase()} ORIGINAL`}</span>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ ...clip, fontSize: 10, opacity: 0.65, letterSpacing: 1 }}>{m.cert} · {m.genre.toUpperCase()}</div>
        <div style={{ ...clip, fontFamily: HEAD, fontSize: 24, lineHeight: 1.15 }}>{m.title.toUpperCase()}</div>
        <div style={{ ...clip, fontSize: 11, opacity: 0.7, marginBottom: 10 }}>{m.lang}</div>
        <div style={{ background: GOLD, color: "#000", fontWeight: 700, fontSize: 13, textAlign: "center", padding: "9px 0", borderRadius: 99 }}>Book tickets →</div>
      </div>
    </Link>
  );
}

export default function NowShowing() {
  const ready = useHydrated(), cityId = useCity((s) => s.city), city = cityById(ready ? cityId : "chennai");
  const [lang, setLang] = useState("All"), [grid, setGrid] = useState(false);
  useEffect(() => setLang("All"), [city.id]);
  const list = useMemo(() => moviesFor(city).filter((m) => lang === "All" || (lang === "regional" ? !m.pan : lang === "pan" ? m.pan : m.lang.includes(lang))), [city, lang]);
  const PILLS: [string, string][] = [["All", "All"], ["regional", `${city.home} Regional`], ["pan", "Pan-India"], ...langsFor(city).filter((l) => l !== city.home).map((l): [string, string] => [l, l])];
  const row = useRef<HTMLDivElement>(null), drag = useRef({ down: false, x: 0, sl: 0, moved: 0 });

  const curve = () => { // bend cards along an arc, based on distance from the centre
    const r = row.current; if (!r) return;
    r.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
      const x = (el.offsetLeft + el.offsetWidth / 2 - r.scrollLeft - r.clientWidth / 2) / r.clientWidth;
      el.style.transform = `translateY(${x * x * 90}px) rotate(${x * 9}deg) rotateY(${-x * 24}deg)`;
    });
  };
  useEffect(() => { row.current?.scrollTo({ left: 0 }); curve(); const f = () => curve(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, [list, grid]);

  return (
    <section id="now-showing" style={{ background: "#07080c", color: "#fff", padding: "6vh 0 3vh", fontFamily: "system-ui, sans-serif" }}>
      <style>{`.cv-row::-webkit-scrollbar{display:none}@keyframes cvm{to{transform:translateX(-50%)}}.cv-mq:hover{animation-play-state:paused}`}</style>
      <div style={{ padding: "0 5vw", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 30, margin: 0 }}>Now showing in {city.name}</h2>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Book tickets for movies running in theatres near you</div>
          </div>
          <button onClick={() => setGrid(!grid)} style={{ background: "none", border: 0, color: GOLD, fontSize: 13, cursor: "pointer" }}>{grid ? "Back to carousel" : `See all (${list.length}) ›`}</button>
        </div>
        <div style={{ display: "flex", gap: 10, margin: "18px 0", flexWrap: "wrap" }}>
          {PILLS.map(([k, label]) => <button key={k} onClick={() => setLang(k)} style={{ padding: "7px 16px", borderRadius: 99, border: "1px solid #ffffff22", cursor: "pointer", fontSize: 13, background: lang === k ? GOLD : "#ffffff0d", color: lang === k ? "#000" : "#fff", fontWeight: lang === k ? 700 : 400 }}>{label}</button>)}
        </div>
        {!list.length && <p style={{ opacity: 0.6 }}>No {lang} movies right now.</p>}
        {grid && <div style={{ display: "flex", flexWrap: "wrap", gap: 22, justifyContent: "center", marginTop: 20 }}>{list.map((m, i) => <Card key={m.id} m={m} rank={i + 1} />)}</div>}
      </div>

      {!grid && list.length > 0 && (
        <div ref={row} className="cv-row" onScroll={curve}
          onPointerDown={(e) => { const r = row.current!, d = drag.current; d.down = true; d.x = e.clientX; d.sl = r.scrollLeft; d.moved = 0; if (e.pointerType === "mouse") r.style.scrollSnapType = "none"; }}
          onPointerMove={(e) => { const d = drag.current; if (!d.down || e.pointerType !== "mouse") return; d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x)); row.current!.scrollLeft = d.sl - (e.clientX - d.x); }}
          onPointerUp={() => { drag.current.down = false; row.current!.style.scrollSnapType = "x proximity"; }}
          onPointerLeave={() => { drag.current.down = false; row.current!.style.scrollSnapType = "x proximity"; }}
          onClickCapture={(e) => { if (drag.current.moved > 6) { e.preventDefault(); e.stopPropagation(); drag.current.moved = 0; } }}
          style={{ position: "relative", display: "flex", gap: 22, overflowX: "auto", overflowY: "hidden", scrollSnapType: "x proximity", perspective: 1200, padding: "56px 5vw 56px max(5vw, calc((100vw - 1300px - 10vw) / 2 + 5vw))", scrollPaddingLeft: "max(5vw, calc((100vw - 1300px - 10vw) / 2 + 5vw))", scrollbarWidth: "none", cursor: "grab", touchAction: "pan-x pan-y" }}>
          {list.map((m, i) => <Card key={m.id} m={m} rank={i + 1} />)}
        </div>
      )}
      <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 2, opacity: 0.45, margin: "-24px 0 20px" }}>DRAG TO SPIN · HOVER TO PAUSE</div>
      <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
        <div className="cv-mq" style={{ display: "inline-block", animation: "cvm 32s linear infinite", fontFamily: HEAD, fontSize: 30, letterSpacing: 1 }}>
          {[0, 1].map((k) => <span key={k}>{MARQUEE.repeat(3).split("✦").map((t, i, a) => <span key={i}><span style={{ color: i % 2 ? GOLD : "#fff" }}>{t}</span>{i < a.length - 1 && <span style={{ color: "#ff4b55", fontSize: 16 }}> ✦ </span>}</span>)}</span>)}
        </div>
      </div>
    </section>
  );
}
