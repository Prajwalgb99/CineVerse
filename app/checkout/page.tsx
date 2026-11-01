"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOVIES } from "../../data/movies";
import { SNACKS, useBooking, useHydrated } from "../../lib/booking";
import { CATS, HALL } from "../../lib/hall";
import { getShows } from "../../lib/shows";

const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif", BY_ID = new Map(HALL.map((s) => [s.id, s]));
const card: React.CSSProperties = { background: "#0f1117", border: "1px solid #ffffff14", borderRadius: 16, padding: 20 };
const btn: React.CSSProperties = { padding: "12px 20px", borderRadius: 12, border: 0, background: GOLD, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const ghost: React.CSSProperties = { ...btn, background: "#ffffff12", color: "#fff" };
const STEPS = ["Snacks", "Review", "Pay"] as const;

export default function Checkout() {
  const b = useBooking(), router = useRouter(), ready = useHydrated();
  const [step, setStep] = useState(0), [method, setMethod] = useState("UPI"), [busy, setBusy] = useState(false);
  if (!ready) return null;
  if (!b.seats.length) return <main style={{ ...page, textAlign: "center" }}><p>No seats selected yet.</p><Link href="/" style={{ color: GOLD }}>Pick a movie</Link></main>;

  const movie = MOVIES.find((m) => m.id === b.movieId) ?? MOVIES[0];
  const theatre = getShows(movie.id, b.day).find((t) => t.shows.some((s) => s.id === b.showId));
  const show = theatre?.shows.find((s) => s.id === b.showId);
  const seatTotal = b.seats.reduce((t, id) => t + CATS[BY_ID.get(id)!.cat].price, 0);
  const lines = SNACKS.filter((s) => b.cart[s.id]);
  const snackTotal = lines.reduce((t, s) => t + s.price * b.cart[s.id], 0);
  const fee = 25 * b.seats.length, total = seatTotal + snackTotal + fee;
  const date = new Date(Date.now() + b.day * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const pay = () => {
    setBusy(true);
    setTimeout(() => { // mock payment: always succeeds
      const id = "CV" + Math.random().toString(36).slice(2, 8).toUpperCase();
      b.confirm({ id, movieId: movie.id, title: movie.title, theatre: theatre?.name ?? "Cineverse", area: theatre?.area ?? "", time: show?.time ?? "", fmt: show?.fmt ?? "2D", date, seats: b.seats, snacks: lines.map((s) => `${b.cart[s.id]}× ${s.name}`), total });
      router.replace("/tickets?new=" + id);
    }, 1500);
  };

  return (
    <main style={page}>
      <div style={{ display: "flex", gap: 18, marginBottom: 24, alignItems: "center" }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontFamily: HEAD, fontSize: 20 }}>CINEVERSE</Link>
        {STEPS.map((s, i) => <span key={s} style={{ fontSize: 13, color: i === step ? GOLD : "#ffffff77", fontWeight: i === step ? 700 : 400 }}>{i + 1}. {s}</span>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
        <div style={{ gridColumn: "span 2" }}>
          {step === 0 && (
            <div style={card}>
              <h2 style={h2}>Add snacks <small style={{ fontWeight: 400, opacity: 0.6 }}>· optional</small></h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                {SNACKS.map((s) => (
                  <div key={s.id} style={{ ...card, padding: 14, background: "#161922" }}>
                    <div style={{ fontSize: 40 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, margin: "6px 0" }}>{s.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <b>₹{s.price}</b>
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {b.cart[s.id] ? <><button style={qty} onClick={() => b.add(s.id, -1)}>−</button>{b.cart[s.id]}</> : null}
                        <button style={qty} onClick={() => b.add(s.id, 1)}>+</button>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div style={card}>
              <h2 style={h2}>Review your order</h2>
              <p style={{ margin: 0 }}><b>{movie.title}</b> · {movie.lang}</p>
              <p style={{ opacity: 0.7, fontSize: 13 }}>{theatre?.name}, {theatre?.area} · {date} · {show?.time} · {show?.fmt}</p>
              <p style={{ fontSize: 13 }}>Seats: <b>{b.seats.join(", ")}</b></p>
              {lines.map((s) => <p key={s.id} style={{ fontSize: 13, margin: "4px 0" }}>{b.cart[s.id]}× {s.name}</p>)}
            </div>
          )}
          {step === 2 && (
            <div style={card}>
              <h2 style={h2}>Pay ₹{total}</h2>
              {["UPI", "Card", "Net banking"].map((m) => (
                <label key={m} style={{ display: "block", padding: 12, border: `1px solid ${method === m ? GOLD : "#ffffff22"}`, borderRadius: 12, marginBottom: 10, cursor: "pointer" }}>
                  <input type="radio" checked={method === m} onChange={() => setMethod(m)} /> {m}
                </label>
              ))}
              <p style={{ fontSize: 12, opacity: 0.6 }}>Demo checkout. No real payment is taken.</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {step > 0 ? <button style={ghost} onClick={() => setStep(step - 1)} disabled={busy}>Back</button> : <button style={ghost} onClick={() => router.back()}>Change seats</button>}
            {step < 2 ? <button style={btn} onClick={() => setStep(step + 1)}>{step === 0 ? (lines.length ? "Review order" : "Skip snacks") : "Continue to pay"}</button>
              : <button style={btn} onClick={pay} disabled={busy}>{busy ? "Processing…" : `Pay ₹${total}`}</button>}
          </div>
        </div>
        <aside style={{ ...card, alignSelf: "start" }}>
          <b>{movie.title}</b>
          <Row l={`Seats (${b.seats.length})`} r={seatTotal} />
          {snackTotal > 0 && <Row l="Snacks" r={snackTotal} />}
          <Row l="Convenience fee" r={fee} />
          <div style={{ borderTop: "1px solid #ffffff22", marginTop: 12, paddingTop: 12, fontSize: 22, fontWeight: 700, display: "flex", justifyContent: "space-between" }}><span>Total</span><span>₹{total}</span></div>
        </aside>
      </div>
    </main>
  );
}
const Row = ({ l, r }: { l: string; r: number }) => <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 10, opacity: 0.85 }}><span>{l}</span><span>₹{r}</span></div>;
const page: React.CSSProperties = { background: "#07080c", color: "#fff", minHeight: "100vh", padding: "24px 5vw", fontFamily: "system-ui, sans-serif" };
const h2: React.CSSProperties = { fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: 28, margin: "0 0 14px", fontWeight: 400 };
const qty: React.CSSProperties = { width: 28, height: 28, borderRadius: 99, border: "1px solid #ffffff33", background: "#ffffff10", color: "#fff", cursor: "pointer" };
