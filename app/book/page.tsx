"use client";
import dynamic from "next/dynamic";
const SeatPicker = dynamic(() => import("../../components/SeatPicker"), { ssr: false });
export default function Book() {
  return <SeatPicker />;
}
