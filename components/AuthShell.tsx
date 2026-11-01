"use client";
import { CSSProperties, ReactNode, useState } from "react";
import { MOVIES } from "../data/movies";
import BackButton from "./BackButton";

export const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif";
export const inp: CSSProperties = { width: "100%", boxSizing: "border-box", marginTop: 6, padding: "12px 14px", borderRadius: 12, border: "1px solid #ffffff22", background: "#ffffff0d", color: "#fff", fontSize: 14 };
export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label style={{ display: "block", marginBottom: 14 }}><span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>{children}{error && <span style={{ color: "#ff6b75", fontSize: 11 }}>{error}</span>}</label>;
}
const TILES: [string, string, number, number, string, number][] = [["jailer2", "6%", 6, -9, "0s", 0], ["varanasi", "30%", 40, 7, "1.2s", 1], ["kantara", "58%", 8, -5, "2.4s", 2], ["rrr", "18%", 56, 6, "0.6s", 3]];
function Tile({ id, top, left, rot, delay }: { id: string; top: string; left: number; rot: number; delay: string }) {
  const m = MOVIES.find((x) => x.id === id)!, [img, setImg] = useState(true);
  return (
    <div className="cv-tile" style={{ top, left: `${left}%`, animationDelay: delay, ["--r" as string]: `${rot}deg`, background: `linear-gradient(160deg, ${m.color}, #05060a)` } as CSSProperties}>
      {img && <img src={`/posters/${m.id}.jpg`} alt="" onError={() => setImg(false)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <span style={{ position: "absolute", left: 10, bottom: 8, fontFamily: HEAD, fontSize: 18, textShadow: "0 2px 8px #000" }}>{m.title.toUpperCase()}</span>
    </div>
  );
}

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="cv-auth" style={{ minHeight: "100svh", display: "grid", gridTemplateColumns: "1.1fr 1fr", background: "#07080c", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        .cv-art{position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% -10%,#1b2a4a,#07080c 70%)}
        .cv-blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.5;animation:cvb 14s ease-in-out infinite alternate}
        .cv-tile{position:absolute;width:150px;height:210px;border-radius:14px;overflow:hidden;box-shadow:0 24px 50px #000c;border:1px solid #ffffff22;animation:cvf 7s ease-in-out infinite}
        .cv-in:focus{outline:none;border-color:${GOLD};box-shadow:0 0 0 3px ${GOLD}33}
        .cv-btn{transition:transform .15s,box-shadow .2s}.cv-btn:hover{transform:translateY(-1px);box-shadow:0 10px 30px ${GOLD}44}
        @keyframes cvb{to{transform:translate(60px,40px) scale(1.2)}}
        @keyframes cvf{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-18px) rotate(var(--r))}}
        @keyframes cvc{to{stroke-dashoffset:0}}
        @keyframes cvu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @media (max-width:900px){.cv-auth{grid-template-columns:1fr !important}.cv-art{display:none !important}}
      `}</style>
      <section className="cv-art">
        <div className="cv-blob" style={{ width: 380, height: 380, background: "#1d4fd8", top: -80, left: -60 }} />
        <div className="cv-blob" style={{ width: 340, height: 340, background: "#f7b731", bottom: -90, right: -40, animationDelay: "3s" }} />
        <div className="cv-blob" style={{ width: 260, height: 260, background: "#d6204a", top: "45%", left: "35%", animationDelay: "6s" }} />
        {TILES.map(([id, top, left, rot, delay]) => <Tile key={id} id={id} top={top} left={left} rot={rot} delay={delay} />)}
        <div style={{ position: "absolute", left: "8%", right: "8%", bottom: "7%" }}>
          <div style={{ fontFamily: HEAD, fontSize: 18, letterSpacing: 2, opacity: 0.8 }}>CINEVERSE</div>
          <div style={{ fontFamily: HEAD, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1, background: `linear-gradient(90deg,#fff,${GOLD})`, WebkitBackgroundClip: "text", color: "transparent" }}>YOUR SEAT<br />IS WAITING.</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", fontSize: 14, opacity: 0.85, lineHeight: 1.9 }}>
            <li>✦ See the screen from your seat before you pay</li>
            <li>✦ Best-seat finder for you and your group</li>
            <li>✦ Every ticket and QR saved in one place</li>
          </ul>
        </div>
      </section>
      <section style={{ display: "grid", placeItems: "center", padding: "32px 5vw", position: "relative" }}>
        <BackButton href="/" style={{ position: "absolute", top: 20, left: 20 }} />
        <div style={{ width: "100%", maxWidth: 420, padding: "30px 28px", borderRadius: 24, background: "linear-gradient(160deg,#ffffff12,#ffffff05)", border: "1px solid #ffffff1f", backdropFilter: "blur(20px)", boxShadow: "0 30px 80px #000a", animation: "cvu .5s ease both" }}>
          <div style={{ fontFamily: HEAD, fontSize: 36, lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 13, opacity: 0.65, margin: "6px 0 22px" }}>{subtitle}</div>
          {children}
        </div>
      </section>
    </main>
  );
}
export const Done = ({ text }: { text: string }) => (
  <div style={{ textAlign: "center", padding: "30px 0", animation: "cvu .5s ease both" }}>
    <svg width="84" height="84" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="#2fd8a4" strokeWidth="2" opacity=".3" /><path d="M15 27l8 8 14-16" fill="none" stroke="#2fd8a4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40" style={{ animation: "cvc .7s .2s ease forwards" }} /></svg>
    <div style={{ fontFamily: HEAD, fontSize: 28, marginTop: 10 }}>{text}</div>
    <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Taking you to the movies…</div>
  </div>
);
