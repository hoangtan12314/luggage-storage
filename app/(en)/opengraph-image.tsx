import { ImageResponse } from "next/og";
import { LOCATION, SIZES } from "@/lib/config";

export const alt = "Ngõ Saigon Luggage Storage — District 1, Ho Chi Minh City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const from = Math.min(...SIZES.map((s) => s.hourly));
  // Satori's automatic font fetching (used by next/og) fails to resolve a
  // glyph for ₫, rendering a tofu box. Spelling out "VND" here avoids it —
  // the real page still shows ₫ fine via normal browser font rendering,
  // this workaround is scoped to the generated share-image only.
  const fromLabel = `${new Intl.NumberFormat("en-US").format(from)} VND`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #7c2d12 0%, #ea580c 55%, #f97316 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.9, display: "flex" }}>🧳 {LOCATION.shortName}</div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 24, display: "flex" }}>
          Luggage Storage
        </div>
        <div style={{ fontSize: 40, opacity: 0.9, marginTop: 12, display: "flex" }}>
          District 1 · Ho Chi Minh City
        </div>
        <div style={{ fontSize: 32, opacity: 0.85, marginTop: 40, display: "flex" }}>
          Book by the hour, day, or week — from {fromLabel}
        </div>
      </div>
    ),
    { ...size }
  );
}
