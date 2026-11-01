"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MOVIES } from "../../../data/movies";
import { fillLabel, getShows } from "../../../lib/shows";

const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const m = MOVIES.find((x) => x.id === id) ?? MOVIES[0];
  const board = useRef<HTMLElement>(null);
  const [muted, setMuted] = useState(true), [videoOk, setVideoOk] = useState(true), [posterOk, setPosterOk] = useState(true);
  const [day, setDay] = useState(0), [days, setDays] = useState<Date[]>([]);
  useEffect(() => setDays(Array.from({ length: 5 }, (_, i) => new Date(Date.now() + i * 864e5))), []);
  const theatres = useMemo(() => getShows(m.id, day), [m.id, day]);
  const pick = useMemo(() => { // smart pick: nearest theatre with a prime-time show that isn't filling up
    for (const t of theatres) for (const s of t.shows) if (s.hour >= 18 && s.hour <= 21 && s.fill < 0.7) return s.id;
    return null;
  }, [theatres]);

  return (
    <main style={{ background: "#07080c", color: "#fff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <section style={{ position: "relative", height: "100vh", overflow: "hidden", background: `linear-gradient(160deg, ${m.color}, #05060a 70%)` }}>
        {videoOk && <video key={m.id} src={`/trailers/${m.id}.mp4`} autoPlay muted={muted} loop playsInline onError={() => setVideoOk(false)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #05060a 8%, transparent 55%), linear-gradient(to bottom, #05060a99, transparent 25%)" }} />
        <Link href="/" style={{ position: "absolute", top: 20, left: "5vw", color: "#fff", textDecoration: "none", fontFamily: HEAD, letterSpacing: 1, fontSize: 20 }}>← CINEVERSE</Link>
        <div style={{ position: "absolute", left: "5vw", right: "5vw", bottom: "6vh", display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
          {posterOk && <img src={`/posters/${m.id}.jpg`} alt="" onError={() => setPosterOk(false)} style={{ width: 90, height: 135, objectFit: "cover", borderRadius: 8 }} />}
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 12, color: "#ff4b55", letterSpacing: 2 }}>{videoOk ? "OFFICIAL TRAILER" : "TRAILER COMING SOON"}</div>
            <div style={{ fontFamily: HEAD, fontSize: "clamp(40px,7vw,84px)", lineHeight: 1 }}>{m.title.toUpperCase()}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>{m.cert} · {m.lang} · {m.dur} · <span style={{ color: GOLD }}>★ {m.rating}</span> · {m.genre}</div>
          </div>
          {videoOk && <button onClick={() => setMuted(!muted)} style={pill}>{muted ? "Sound off" : "Sound on"}</button>}
          <button onClick={() => board.current?.scrollIntoView({ behavior: "smooth" })} style={{ ...pill, background: "#ff2b3a", border: 0, fontWeight: 700 }}>Book tickets ↓</button>
        </div>
      </section>

      <section ref={board} style={{ padding: "6vh 5vw", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: HEAD, fontSize: 34, margin: 0 }}>Pick a show</h2>
        <div style={{ display: "flex", gap: 10, margin: "18px 0 26px", flexWrap: "wrap" }}>
          {days.map((d, i) => (
            <button key={i} onClick={() => setDay(i)} style={{ ...pill, background: day === i ? "#fff" : "#ffffff10", color: day === i ? "#000" : "#fff", textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{d.toLocaleDateString("en-IN", { weekday: "short" })}</div>
              <b>{d.getDate()} {d.toLocaleDateString("en-IN", { month: "short" })}</b>
            </button>
          ))}
        </div>
        {theatres.map((t) => (
          <div key={t.id} style={{ display: "flex", gap: 24, padding: "18px 0", borderTop: "1px solid #ffffff14", flexWrap: "wrap" }}>
            <div style={{ width: 200 }}><b>{t.name}</b><div style={{ fontSize: 12, opacity: 0.6 }}>{t.area} · {t.dist} km</div></div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1 }}>
              {t.shows.map((s) => {
                const [label, col] = fillLabel(s.fill);
                return (
                  <button key={s.id} onClick={() => router.push(`/book?movie=${m.id}&show=${s.id}`)}
                    style={{ ...pill, border: `1px solid ${col}88`, textAlign: "left", position: "relative", minWidth: 120 }}>
                    {pick === s.id && <span style={{ position: "absolute", top: -9, left: 8, background: GOLD, color: "#000", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 8px" }}>★ Best pick</span>}
                    <b>{s.time}</b>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{s.fmt} · from ₹{s.price}</div>
                    <div style={{ fontSize: 10, color: col, marginTop: 2 }}>{label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
const pill: React.CSSProperties = { padding: "10px 16px", borderRadius: 12, border: "1px solid #ffffff22", background: "#ffffff10", color: "#fff", fontSize: 13, cursor: "pointer" };
