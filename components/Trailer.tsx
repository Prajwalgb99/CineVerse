"use client";
import { useEffect, useRef, useState } from "react";
const GOLD = "#f7b731";
const fmt = (t: number) => { if (!isFinite(t) || t < 0) t = 0; return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`; };
const loadYT = () => new Promise<any>((res) => {
  const w = window as any;
  if (w.YT?.Player) return res(w.YT);
  const prev = w.onYouTubeIframeAPIReady;
  w.onYouTubeIframeAPIReady = () => { prev?.(); res(w.YT); };
  if (!document.getElementById("yt-api")) { const s = document.createElement("script"); s.id = "yt-api"; s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s); }
});
const I = ({ d }: { d: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>;
const PLAY = "M8 5v14l11-7z", PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z", VOL = "M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z", MUTE = "M3 9v6h4l5 4V5L7 9H3zm13 1.4L17.4 9 19.5 11 21.6 9 23 10.4 20.9 12.5 23 14.6 21.6 16 19.5 13.9 17.4 16 16 14.6 18.1 12.5z";
const circle: React.CSSProperties = { width: 38, height: 38, borderRadius: 99, border: "1px solid #ffffff2a", background: "#ffffff14", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", padding: 0, fontSize: 11, fontWeight: 700 };

/** Trailer background + controls (play/pause, ±10s, scrub bar, mute). Toggling sound never restarts the video. */
export default function Trailer({ yt, id, onFail }: { yt?: string; id: string; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null), vid = useRef<HTMLVideoElement>(null), pl = useRef<any>(null), scrub = useRef(false);
  const [muted, setMuted] = useState(true), [playing, setPlaying] = useState(true), [cur, setCur] = useState(0), [dur, setDur] = useState(0);

  useEffect(() => { // YouTube via the IFrame API so we can mute/seek without reloading
    if (!yt) return;
    let dead = false; const el = document.createElement("div"); host.current!.appendChild(el);
    loadYT().then((YT) => {
      if (dead) return;
      pl.current = new YT.Player(el, { videoId: yt, playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: yt, playsinline: 1, modestbranding: 1, rel: 0, disablekb: 1, iv_load_policy: 3 },
        events: { onStateChange: (e: any) => setPlaying(e.data === 1 || e.data === 3) } });
    });
    return () => { dead = true; try { pl.current?.destroy(); } catch {} pl.current = null; if (host.current) host.current.innerHTML = ""; };
  }, [yt]);

  useEffect(() => {
    const t = setInterval(() => {
      if (scrub.current) return;
      const p = pl.current, v = vid.current;
      if (yt && p?.getCurrentTime) { setCur(p.getCurrentTime()); setDur(p.getDuration() || 0); }
      else if (v) { setCur(v.currentTime); setDur(v.duration || 0); }
    }, 250);
    return () => clearInterval(t);
  }, [yt]);

  const seek = (t: number) => {
    const n = Math.max(0, Math.min(dur || 1e9, t)); setCur(n);
    if (yt) pl.current?.seekTo(n, true); else if (vid.current) vid.current.currentTime = n;
  };
  const toggle = () => {
    if (yt) { playing ? pl.current?.pauseVideo() : pl.current?.playVideo(); return; }
    const v = vid.current!, was = v.paused; was ? v.play() : v.pause(); setPlaying(was);
  };
  const mute = () => {
    const n = !muted; setMuted(n);
    if (yt) { if (n) pl.current?.mute(); else { pl.current?.unMute(); pl.current?.setVolume(100); } }
    else if (vid.current) vid.current.muted = n;
  };
  const pct = dur ? Math.min(100, (cur / dur) * 100) : 0;
  return (
    <>
      <style>{`.cv-yt iframe{position:absolute;top:50%;left:50%;width:max(100vw,177.78svh);height:max(56.25vw,100svh);transform:translate(-50%,-50%);border:0;pointer-events:none}
        .cv-range{-webkit-appearance:none;appearance:none;height:4px;border-radius:4px;outline:none;cursor:pointer}
        .cv-range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px #f7b73155}
        .cv-range::-moz-range-thumb{width:14px;height:14px;border:0;border-radius:50%;background:#fff}`}</style>
      {yt ? <div ref={host} className="cv-yt" style={{ position: "absolute", inset: 0, overflow: "hidden" }} />
        : <video ref={vid} src={`/trailers/${id}.mp4`} autoPlay muted loop playsInline onError={onFail} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <div style={{ position: "absolute", left: "5vw", right: "5vw", bottom: "3vh", zIndex: 3, display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 18, background: "#05060ab3", border: "1px solid #ffffff18", backdropFilter: "blur(12px)" }}>
        <button style={circle} onClick={toggle} aria-label={playing ? "Pause" : "Play"}><I d={playing ? PAUSE : PLAY} /></button>
        <button style={circle} onClick={() => seek(cur - 10)} aria-label="Back 10 seconds">−10</button>
        <button style={circle} onClick={() => seek(cur + 10)} aria-label="Forward 10 seconds">+10</button>
        <span style={{ fontSize: 12, opacity: 0.85, minWidth: 38, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(cur)}</span>
        <input className="cv-range" type="range" min={0} max={dur || 1} step={0.1} value={Math.min(cur, dur || 1)} aria-label="Trailer timeline"
          onPointerDown={() => (scrub.current = true)} onPointerUp={() => (scrub.current = false)} onChange={(e) => seek(Number(e.target.value))}
          style={{ flex: 1, background: `linear-gradient(to right, ${GOLD} ${pct}%, #ffffff33 ${pct}%)` }} />
        <span style={{ fontSize: 12, opacity: 0.6, minWidth: 38, fontVariantNumeric: "tabular-nums" }}>{fmt(dur)}</span>
        <button style={{ ...circle, color: muted ? "#ffffffaa" : GOLD }} onClick={mute} aria-label={muted ? "Turn sound on" : "Turn sound off"}><I d={muted ? MUTE : VOL} /></button>
      </div>
    </>
  );
}
