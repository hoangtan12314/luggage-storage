import { ImageResponse } from "next/og";
import { LOCATION, WORKSHOPS } from "@/lib/config";

export const alt = "Vietnamese Cooking Classes at Ngõ Saigon — District 1, Ho Chi Minh City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  // See app/(en)/luggage/opengraph-image.tsx: next/og's font fetching has no
  // glyph for ₫, so this spells out "VND" rather than showing a tofu box.
  const cheapest = Math.min(...WORKSHOPS.map((w) => w.pricePerPerson));
  const fromLabel = `${new Intl.NumberFormat("en-US").format(cheapest)} VND`;

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
          background: "linear-gradient(135deg, #3b2314 0%, #8a5a2b 55%, #d9a054 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.9, display: "flex" }}>{LOCATION.shortName}</div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 24, display: "flex" }}>
          Cooking Classes
        </div>
        <div style={{ fontSize: 40, opacity: 0.9, marginTop: 12, display: "flex" }}>
          District 1 · Ho Chi Minh City
        </div>
        <div style={{ fontSize: 32, opacity: 0.85, marginTop: 40, display: "flex" }}>
          From {fromLabel} / person
        </div>
      </div>
    ),
    { ...size }
  );
}
