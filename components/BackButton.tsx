"use client";
import { useRouter } from "next/navigation";
/** Round glass back button. Goes to `href` if given, otherwise to the previous page (or home when there is none). */
export default function BackButton({ href, style }: { href?: string; style?: React.CSSProperties }) {
  const router = useRouter();
  return (
    <button aria-label="Go back" onClick={() => (href ? router.push(href) : window.history.length > 1 ? router.back() : router.push("/"))}
      style={{ width: 40, height: 40, borderRadius: 99, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff", background: "#ffffff14", border: "1px solid #ffffff2a", backdropFilter: "blur(10px)", padding: 0, flex: "none", ...style }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
    </button>
  );
}
