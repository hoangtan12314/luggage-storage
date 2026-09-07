import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { getNextDayAvailability } from "@/lib/get-availability";
import { buildHomeMetadata } from "@/lib/seo";

export const metadata: Metadata = buildHomeMetadata("vi");

// See app/(en)/page.tsx for why this is revalidate: 60 rather than force-dynamic.
export const revalidate = 60;

export default async function HomeVi() {
  const availability = await getNextDayAvailability();
  return <HomePage locale="vi" availability={availability} />;
}
