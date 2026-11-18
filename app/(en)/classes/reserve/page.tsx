import type { Metadata } from "next";
import { ClassReservePage } from "@/components/class-reserve-page";
import { classesCopy } from "@/lib/i18n";
import { noIndexMetadata } from "@/lib/seo";

// Carries the guest's selection in the query string and leads to a form with
// personal details: keep it out of search results (and out of robots.txt).
export const metadata: Metadata = {
  ...noIndexMetadata,
  title: { absolute: `${classesCopy.en.reserve.summary.heading} | Ngõ Saigon` },
};

export default async function ReservePage(props: PageProps<"/classes/reserve">) {
  return <ClassReservePage locale="en" searchParams={await props.searchParams} />;
}
