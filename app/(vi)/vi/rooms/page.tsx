import type { Metadata } from "next";
import { RoomsPage } from "@/components/rooms-page";
import { getTonightRoomAvailability } from "@/lib/get-availability";
import { buildRoomsMetadata } from "@/lib/seo";

export const metadata: Metadata = buildRoomsMetadata("vi");

export const revalidate = 60;

export default async function RoomsVi() {
  const availability = await getTonightRoomAvailability();
  return <RoomsPage locale="vi" availability={availability} />;
}
