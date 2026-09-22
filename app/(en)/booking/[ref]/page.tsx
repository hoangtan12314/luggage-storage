import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OrderSummary } from "@/components/order-summary";
import { Card } from "@/components/ui/card";
import { LOCATION } from "@/lib/config";
import { findByRef } from "@/lib/data/bookings";
import { quote, quoteRoom } from "@/lib/pricing";
import { noIndexMetadata } from "@/lib/seo";
import type { AnyQuote } from "@/lib/types";

// Contains the guest's booking reference and order details — must never be
// indexed. See also app/robots.ts, which disallows crawling /booking/.
export const metadata: Metadata = noIndexMetadata;

export default async function BookingConfirmationPage(
  props: PageProps<"/booking/[ref]">
) {
  const { ref } = await props.params;
  const booking = await findByRef(ref);

  if (!booking) {
    notFound();
  }

  // Re-derive the breakdown from the stored booking so the confirmation
  // shows the same itemization as checkout. The stored total remains
  // authoritative regardless of what this recomputes.
  const priced: AnyQuote =
    booking.kind === "room"
      ? quoteRoom(booking.start, booking.end, booking.roomQuantity ?? 1)
      : quote(booking.items ?? [], booking.start, booking.end);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-lg px-6 py-12">
        <div className="text-center">
          <CheckCircle2 className="text-brand-ink mx-auto size-10" />
          <p className="text-brand-ink mt-2 text-sm font-medium">
            {booking.kind === "room" ? "Room reserved" : "Booking confirmed"}
          </p>
          <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight">
            {booking.ref}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {booking.kind === "room"
              ? "Show this reference code at check-in. Pay on arrival."
              : "Show this reference code at drop-off and pickup."}
          </p>
        </div>

        <Card className="mt-8 p-6">
          <OrderSummary quote={priced} />
        </Card>

        <Card className="mt-4 p-6">
          <h2 className="font-semibold">{LOCATION.name}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{LOCATION.address}</p>
          <p className="text-muted-foreground text-sm">{LOCATION.hours}</p>
          <a
            href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
            className="text-brand-ink mt-2 inline-block text-sm hover:underline"
          >
            {LOCATION.phone}
          </a>
        </Card>

        <p className="mt-8 text-center">
          <Link href="/" className="text-brand-ink hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
