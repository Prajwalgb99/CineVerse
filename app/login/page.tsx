"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell, { Done, Field, GOLD, inp } from "../../components/AuthShell";
import { useAuth } from "../../lib/auth";

export default function Login() {
  const router = useRouter(), signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [error, setError] = useState(""), [done, setDone] = useState(false);
  const go = () => {
    if (!email.includes("@") || pw.length < 1) return setError("Enter your email and password");
    if (!signIn(email)) return setError("No account found on this device. Please sign up first.");
    setDone(true); setTimeout(() => router.push("/"), 1200);
  };
  return (
    <AuthShell title="WELCOME BACK" subtitle="Sign in to see your tickets and book faster.">
      {done ? <Done text="Signed in!" /> : (
        <>
          <Field label="Email"><input className="cv-in" style={inp} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" autoComplete="email" /></Field>
          <Field label="Password"><input className="cv-in" style={inp} value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Your password" autoComplete="current-password" onKeyDown={(e) => e.key === "Enter" && go()} /></Field>
          {error && <p style={{ color: "#ff6b75", fontSize: 12, margin: "0 0 10px" }}>{error}</p>}
          <button className="cv-btn" onClick={go} style={{ width: "100%", padding: 14, borderRadius: 14, border: 0, background: `linear-gradient(90deg,${GOLD},#ffd56b)`, color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Sign in</button>
          <p style={{ textAlign: "center", fontSize: 13, opacity: 0.75, margin: "16px 0 0" }}>New to Cineverse? <Link href="/signup" style={{ color: GOLD }}>Create an account</Link></p>
        </>
      )}
    </AuthShell>
  );
}
