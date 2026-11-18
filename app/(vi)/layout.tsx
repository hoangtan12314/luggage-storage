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
    default: "Ngõ Saigon - Gửi Hành Lý",
    template: "%s | Ngõ Saigon",
  },
};

// The Vietnamese counterpart to app/(en)/layout.tsx — see that file for why
// there are two root layouts instead of Next's [lang] segment convention.
export default function VietnameseRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader locale="vi" />
        {children}
        <SiteFooter locale="vi" />
      </body>
    </html>
  );
}
