"use client";
import dynamic from "next/dynamic";
import NowShowing from "../components/NowShowing";
const PanoramaHero = dynamic(() => import("../components/PanoramaHero"), { ssr: false });
export default function Page() {
  return (
    <main style={{ background: "#07080c" }}>
      <PanoramaHero />
      <NowShowing />
      <footer style={{ padding: "30px 5vw", textAlign: "center", fontSize: 12, opacity: 0.4, color: "#fff" }}>Cineverse · demo project</footer>
    </main>
  );
}
