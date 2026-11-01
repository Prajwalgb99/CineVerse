"use client";
import { CSSProperties, ReactNode } from "react";
import BackButton from "./BackButton";

export const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif";
export const inp: CSSProperties = { width: "100%", boxSizing: "border-box", marginTop: 6, padding: "12px 14px", borderRadius: 12, border: "1px solid #ffffff22", background: "#ffffff0d", color: "#fff", fontSize: 14 };
export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label style={{ display: "block", marginBottom: 14 }}><span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>{children}{error && <span style={{ color: "#ff6b75", fontSize: 11 }}>{error}</span>}</label>;
}
const DUST = Array.from({ length: 16 }, (_, i) => ({ l: (i * 37) % 100, d: 6 + (i * 7) % 9, s: (i * 13) % 10 }));

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="cv-auth" style={{ minHeight: "100svh", display: "grid", gridTemplateColumns: "1.1fr 1fr", background: "#07080c", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        .cv-art{position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#14234a 0%,#070912 62%,#04050b 100%)}
        .cv-beam{position:absolute;top:-2%;left:50%;width:140%;height:78%;transform:translateX(-50%);clip-path:polygon(47% 0,53% 0,100% 100%,0 100%);background:linear-gradient(180deg,#cfe3ff55,#cfe3ff00 92%);animation:cvq 5s ease-in-out infinite}
        .cv-lamp{position:absolute;top:-70px;left:50%;width:160px;height:160px;margin-left:-80px;border-radius:50%;background:radial-gradient(circle,#fff,#8cb8ff 30%,#0000 70%);filter:blur(6px)}
        .cv-floor{position:absolute;left:-10%;right:-10%;bottom:-18%;height:46%;border-radius:50%;background:radial-gradient(ellipse,#f7b73155,#3b6dff22 45%,#0000 70%)}
        .cv-film{position:absolute;top:0;bottom:0;width:46px;background:#090b12;border-inline:1px solid #ffffff18;background-image:linear-gradient(#ffffff2a 58%,#0000 58%),linear-gradient(#ffffff2a 58%,#0000 58%);background-size:14px 34px;background-repeat:repeat-y;background-position:6px 0,26px 0;animation:cvs 7s linear infinite;opacity:.8}
        .cv-reel{position:absolute;top:19%;left:50%;width:150px;height:150px;margin-left:-75px;animation:cvr 24s linear infinite;filter:drop-shadow(0 0 22px #f7b73166)}
        .cv-dust{position:absolute;bottom:-10px;width:4px;height:4px;border-radius:50%;background:#cfe3ff;opacity:0;animation:cvd linear infinite}
        .cv-in:focus{outline:none;border-color:${GOLD};box-shadow:0 0 0 3px ${GOLD}33}
        .cv-btn{transition:transform .15s,box-shadow .2s}.cv-btn:hover{transform:translateY(-1px);box-shadow:0 10px 30px ${GOLD}44}
        @keyframes cvq{0%,100%{opacity:.85}50%{opacity:1}}
        @keyframes cvs{to{background-position:6px 34px,26px 34px}}
        @keyframes cvr{to{transform:rotate(360deg)}}
        @keyframes cvd{0%{transform:translateY(0);opacity:0}15%{opacity:.8}100%{transform:translateY(-520px);opacity:0}}
        @keyframes cvc{to{stroke-dashoffset:0}}
        @keyframes cvu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @media (max-width:900px){.cv-auth{grid-template-columns:1fr !important}.cv-art{display:none !important}}
      `}</style>
      <section className="cv-art">
        <div className="cv-beam" /><div className="cv-lamp" /><div className="cv-floor" />
        <div className="cv-film" style={{ left: 0 }} /><div className="cv-film" style={{ right: 0 }} />
        {DUST.map((p, i) => <i key={i} className="cv-dust" style={{ left: `${p.l}%`, animationDuration: `${p.d}s`, animationDelay: `${p.s * 0.6}s` }} />)}
        <svg className="cv-reel" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="#0b0e18" stroke="#f7b731" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="8" fill="#f7b731" />
          {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={50 + 26 * Math.cos((a * Math.PI) / 180)} cy={50 + 26 * Math.sin((a * Math.PI) / 180)} r="9" fill="#04050b" stroke="#f7b73188" strokeWidth="1.5" />)}
        </svg>
        <div style={{ position: "absolute", left: "12%", right: "12%", bottom: "7%" }}>
          <div style={{ fontFamily: HEAD, fontSize: 18, letterSpacing: 3, opacity: 0.75 }}>CINEVERSE</div>
          <div style={{ fontFamily: HEAD, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1, background: `linear-gradient(90deg,#fff,${GOLD})`, WebkitBackgroundClip: "text", color: "transparent" }}>YOUR SEAT<br />IS WAITING.</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            {["7 cities", "3D seat view", "QR tickets"].map((t) => <span key={t} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 99, border: "1px solid #ffffff2a", background: "#ffffff0d" }}>{t}</span>)}
          </div>
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
