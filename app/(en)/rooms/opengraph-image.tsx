import { ImageResponse } from "next/og";
import { LOCATION, ROOM } from "@/lib/config";

export const alt = "Room Booking at Ngõ Saigon Homestay — District 1, Ho Chi Minh City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  // See app/(en)/luggage/opengraph-image.tsx: next/og's font fetching has no
  // glyph for ₫, so this spells out "VND" rather than showing a tofu box.
  const nightlyLabel = `${new Intl.NumberFormat("en-US").format(ROOM.nightly)} VND`;

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
          background: "linear-gradient(135deg, #7c2d12 0%, #ea580c 55%, #f9a61c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.9, display: "flex" }}>🏠 {LOCATION.shortName}</div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 24, display: "flex" }}>
          Room Booking
        </div>
        <div style={{ fontSize: 40, opacity: 0.9, marginTop: 12, display: "flex" }}>
          District 1 · Ho Chi Minh City
        </div>
        <div style={{ fontSize: 32, opacity: 0.85, marginTop: 40, display: "flex" }}>
          From {nightlyLabel} / night
        </div>
      </div>
    ),
    { ...size }
  );
}
