import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Relish Cakebox — custom cakes in Marangattupilly, Pala";
export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, background: "#FFF6E8", color: "#3E2A1E" }}>
      <div style={{ fontSize: 72, fontWeight: 700 }}>Relish Cakebox</div>
      <div style={{ fontSize: 34, marginTop: 18 }}>Custom cakes baked with love in Marangattupilly, Pala</div>
      <div style={{ fontSize: 28, marginTop: 28, color: "#B85C38" }}>Order on WhatsApp +91 92078 43867</div>
    </div>,
    size,
  );
}
