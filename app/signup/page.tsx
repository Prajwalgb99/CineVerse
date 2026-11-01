"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell, { Done, Field, GOLD, inp } from "../../components/AuthShell";
import { CITIES } from "../../data/cities";
import { useAuth } from "../../lib/auth";
import { useCity } from "../../lib/city";

export default function SignUp() {
  const router = useRouter(), signUp = useAuth((s) => s.signUp);
  const [f, setF] = useState({ name: "", email: "", phone: "", city: useCity.getState().city, pw: "" });
  const [show, setShow] = useState(false), [terms, setTerms] = useState(false), [tried, setTried] = useState(false), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const score = [f.pw.length >= 8, /[A-Z]/.test(f.pw), /[0-9]/.test(f.pw), /[^A-Za-z0-9]/.test(f.pw)].filter(Boolean).length;
  const err = {
    name: f.name.trim().length < 2 ? "Enter your full name" : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) ? "" : "Enter a valid email",
    phone: /^[6-9]\d{9}$/.test(f.phone) ? "" : "Enter a 10-digit mobile number",
    pw: f.pw.length < 8 ? "Use at least 8 characters" : "",
    terms: terms ? "" : "Please accept the terms",
  };
  const bad = Object.values(err).some(Boolean);
  const submit = () => {
    setTried(true); if (bad) return; setBusy(true);
    setTimeout(() => { // demo: profile saved on this device only (password is never stored)
      signUp({ name: f.name.trim(), email: f.email.trim().toLowerCase(), phone: f.phone, city: f.city });
      useCity.getState().set(f.city); setDone(true); setTimeout(() => router.push("/"), 1700);
    }, 900);
  };
  const e = (k: keyof typeof err) => (tried ? err[k] : "");
  return (
    <AuthShell title="CREATE ACCOUNT" subtitle="Join Cineverse and book seats in a real 3D theatre.">
      {done ? <Done text={`Welcome, ${f.name.trim().split(" ")[0]}!`} /> : (
        <>
          <Field label="Full name" error={e("name")}><input className="cv-in" style={inp} value={f.name} onChange={set("name")} placeholder="Your name" autoComplete="name" /></Field>
          <Field label="Email" error={e("email")}><input className="cv-in" style={inp} value={f.email} onChange={set("email")} placeholder="you@email.com" type="email" autoComplete="email" /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1.3 }}><Field label="Mobile" error={e("phone")}><input className="cv-in" style={inp} value={f.phone} onChange={(ev) => setF({ ...f, phone: ev.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="98765 43210" inputMode="numeric" autoComplete="tel" /></Field></div>
            <div style={{ flex: 1 }}><Field label="City"><select className="cv-in" style={{ ...inp, appearance: "none" }} value={f.city} onChange={set("city")}>{CITIES.map((c) => <option key={c.id} value={c.id} style={{ background: "#0b0d12" }}>{c.name}</option>)}</select></Field></div>
          </div>
          <Field label="Password" error={e("pw")}>
            <div style={{ position: "relative" }}>
              <input className="cv-in" style={{ ...inp, paddingRight: 56 }} value={f.pw} onChange={set("pw")} placeholder="At least 8 characters" type={show ? "text" : "password"} autoComplete="new-password" />
              <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: 14, background: "none", border: 0, color: "#ffffffaa", fontSize: 12, cursor: "pointer" }}>{show ? "Hide" : "Show"}</button>
            </div>
            <div style={{ display: "flex", gap: 4, margin: "8px 0 2px" }}>{[0, 1, 2, 3].map((i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < score ? ["#ef4444", "#f59e0b", GOLD, "#2fd8a4"][score - 1] : "#ffffff1f", transition: "background .2s" }} />)}</div>
          </Field>
          <label style={{ display: "flex", gap: 10, fontSize: 12, opacity: 0.8, alignItems: "flex-start", cursor: "pointer" }}>
            <input type="checkbox" checked={terms} onChange={(ev) => setTerms(ev.target.checked)} style={{ marginTop: 2, accentColor: GOLD }} />
            <span>I agree to the Terms of Use and Privacy Policy{e("terms") && <span style={{ color: "#ff6b75", display: "block" }}>{e("terms")}</span>}</span>
          </label>
          <button className="cv-btn" onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 18, padding: 14, borderRadius: 14, border: 0, background: `linear-gradient(90deg,${GOLD},#ffd56b)`, color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>{busy ? "Creating your account…" : "Create account"}</button>
          <p style={{ textAlign: "center", fontSize: 13, opacity: 0.75, margin: "16px 0 0" }}>Already have an account? <Link href="/login" style={{ color: GOLD }}>Sign in</Link></p>
        </>
      )}
    </AuthShell>
  );
}
