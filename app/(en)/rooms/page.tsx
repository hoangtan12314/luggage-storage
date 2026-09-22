import type { Metadata } from "next";
import { RoomsPage } from "@/components/rooms-page";
import { getTonightRoomAvailability } from "@/lib/get-availability";
import { buildRoomsMetadata } from "@/lib/seo";

export const metadata: Metadata = buildRoomsMetadata("en");

// See app/(en)/luggage/page.tsx for why this is revalidate: 60 rather than force-dynamic.
export const revalidate = 60;

export default async function Rooms() {
  const availability = await getTonightRoomAvailability();
  return <RoomsPage locale="en" availability={availability} />;
}
