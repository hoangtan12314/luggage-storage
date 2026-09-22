import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { buildLandingMetadata } from "@/lib/seo";

export const metadata: Metadata = buildLandingMetadata("vi");

export default function HomeVi() {
  return <LandingPage locale="vi" />;
}
