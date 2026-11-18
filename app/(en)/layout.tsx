import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildBaseMetadata } from "@/lib/seo";
import "../globals.css";

// One typeface site-wide (Montserrat). The vietnamese subset is required — without it
// ô/ĩ/ạ etc. fall back to a system font.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildBaseMetadata(),
  title: {
    default: "Ngõ Saigon Luggage Storage",
    template: "%s | Ngõ Saigon",
  },
};

// This is one of two root layouts (see app/(vi)/layout.tsx) — route groups
// let each language own its own <html lang> without changing any URLs.
// Per-page metadata (title/description/canonical) is set in each page.tsx.
export default function EnglishRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader locale="en" />
        {children}
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
