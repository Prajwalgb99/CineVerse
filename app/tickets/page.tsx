"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Suspense, useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import { Ticket, useBooking, useHydrated } from "../../lib/booking";

const GOLD = "#f7b731", HEAD = "Impact, 'Arial Narrow', sans-serif";

function Qr({ t }: { t: Ticket }) {
  const [src, setSrc] = useState("");
  useEffect(() => { QRCode.toDataURL(`CINEVERSE|${t.id}|${t.seats.join(",")}`, { margin: 1, width: 180 }).then(setSrc); }, [t]);
  return src ? <img src={src} alt={`QR for ${t.id}`} width={130} height={130} style={{ borderRadius: 8, background: "#fff" }} /> : <div style={{ width: 130, height: 130 }} />;
}

function List() {
  const tickets = useBooking((s) => s.tickets), ready = useHydrated(), fresh = useSearchParams().get("new");
  if (!ready) return null;
  return (
    <>
      {fresh && <p style={{ color: "#2fd8a4" }}>Payment successful. Your ticket is ready.</p>}
      {!tickets.length && <p style={{ opacity: 0.7 }}>No tickets yet. <Link href="/" style={{ color: GOLD }}>Book a movie</Link></p>}
      {tickets.map((t) => (
        <div key={t.id} style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", background: "#0f1117", border: `1px solid ${t.id === fresh ? GOLD : "#ffffff14"}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <Qr t={t} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: HEAD, fontSize: 28 }}>{t.title.toUpperCase()}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t.theatre}, {t.area}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t.date} · {t.time} · {t.fmt}</div>
            <div style={{ marginTop: 8 }}>Seats: <b>{t.seats.join(", ")}</b></div>
            {t.snacks.length > 0 && <div style={{ fontSize: 12, opacity: 0.7 }}>{t.snacks.join(" · ")}</div>}
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, opacity: 0.6 }}>Booking ID</div><b>{t.id}</b><div style={{ marginTop: 6 }}>₹{t.total}</div></div>
        </div>
      ))}
    </>
  );
}

export default function Tickets() {
  return (
    <main style={{ background: "#07080c", color: "#fff", minHeight: "100vh", padding: "24px 5vw", fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><BackButton href="/" /><Link href="/" style={{ color: "#fff", textDecoration: "none", fontFamily: HEAD, fontSize: 20 }}>CINEVERSE</Link></div>
      <h1 style={{ fontFamily: HEAD, fontWeight: 400, fontSize: 40 }}>My tickets</h1>
      <Suspense><List /></Suspense>
    </main>
  );
}
