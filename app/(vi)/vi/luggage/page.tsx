import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { getNextDayAvailability } from "@/lib/get-availability";
import { buildLuggageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildLuggageMetadata("vi");

// See app/(en)/luggage/page.tsx for why this is revalidate: 60 rather than force-dynamic.
export const revalidate = 60;

export default async function LuggagePageVi() {
  const availability = await getNextDayAvailability();
  return <HomePage locale="vi" availability={availability} />;
}
