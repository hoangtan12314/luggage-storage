import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { getNextDayAvailability } from "@/lib/get-availability";
import { buildHomeMetadata } from "@/lib/seo";

export const metadata: Metadata = buildHomeMetadata("en");

// Revalidated every 60s rather than force-dynamic: availability can be up to
// a minute stale, which is safe because lib/actions.ts re-checks
// authoritatively at checkout. In exchange the page can be cached/crawled
// fast instead of hitting the store on every single request.
export const revalidate = 60;

export default async function Home() {
  const availability = await getNextDayAvailability();
  return <HomePage locale="en" availability={availability} />;
}
