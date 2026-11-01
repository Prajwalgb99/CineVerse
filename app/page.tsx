"use client";
import dynamic from "next/dynamic";
const PanoramaHero = dynamic(() => import("../components/PanoramaHero"), { ssr: false });
export default function Page() {
  return <PanoramaHero />;
}
