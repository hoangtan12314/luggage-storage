import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { MeetingPoint } from "@/components/meeting-point";
import { OrderSummary } from "@/components/order-summary";
import { RequestNotice } from "@/components/request-notice";
import { quoteForBooking } from "@/lib/booking-quote";
import { verifyBookingToken } from "@/lib/confirm-token";
import { getCampus, getMeetingAddress, getWorkshop, LOCATION } from "@/lib/config";
import { findByRef } from "@/lib/data/bookings";
import { noIndexMetadata } from "@/lib/seo";

// Contains the guest's booking reference and order details — must never be
// indexed. See also app/robots.ts, which disallows crawling /booking/.
export const metadata: Metadata = noIndexMetadata;

const card =
  "rounded-3xl border border-white/70 bg-white/60 p-6 text-cocoa shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]";

/**
 * "Request received" page. The booking is read from the signed token in the
 * URL (so it works even when the in-memory store has been reset or sits on
 * another serverless instance), falling back to a lookup by reference.
 */
export default async function BookingRequestPage(props: PageProps<"/booking/[ref]">) {
  const { ref } = await props.params;
  const { t } = await props.searchParams;
  const token = typeof t === "string" ? t : undefined;

  const fromToken = token ? verifyBookingToken(token) : null;
  const booking = fromToken?.ref === ref ? fromToken : await findByRef(ref);
  if (!booking) notFound();

  const priced = quoteForBooking(booking);
  const meetingPoint =
    booking.kind === "class" ? getWorkshop(booking.workshopId ?? "")?.meetingPoint : undefined;
  const contact = booking.customer.whatsapp || booking.customer.phone;

  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <div className="mx-auto max-w-xl px-4 pt-10 pb-20 sm:px-6">
        <div className="text-center">
          <CheckCircle2 aria-hidden className="text-brand-ink mx-auto size-10" strokeWidth={1.6} />
          <p className="text-brand-ink mt-2 text-sm font-medium">Request received</p>
          <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-cocoa">{booking.ref}</h1>
          <p className="text-cocoa-muted mt-2 text-sm">Keep this reference code — you&apos;ll show it when you arrive.</p>
        </div>

        <div className="mt-8">
          <RequestNotice title="Your booking isn’t confirmed yet">
            We’ll message you on WhatsApp{contact ? ` (${contact})` : ""} to confirm. Once we’ve agreed the details
            you’ll get a confirmation email at {booking.customer.email}. You pay on arrival.
          </RequestNotice>
        </div>

        <div className={`${card} mt-6`}>
          <OrderSummary quote={priced} />
        </div>

        {booking.kind === "class" && booking.notes && (
          <div className={`${card} mt-4`}>
            <h2 className="font-display text-lg font-semibold tracking-tight">Your note</h2>
            <p className="text-cocoa-muted mt-1 text-sm whitespace-pre-line">{booking.notes}</p>
          </div>
        )}

        {meetingPoint ? (
          <div className="mt-4">
            <h2 className="font-display mb-2 text-lg font-semibold tracking-tight text-cocoa">Meeting point</h2>
            <MeetingPoint
              address={getMeetingAddress(meetingPoint, "en")}
              label={getCampus(meetingPoint.campus)?.name}
              details={meetingPoint.details}
              openInMaps="Open in Google Maps"
            />
          </div>
        ) : (
          <div className={`${card} mt-4`}>
            <h2 className="font-display text-lg font-semibold tracking-tight">{LOCATION.name}</h2>
            <p className="text-cocoa-muted mt-1 text-sm">{LOCATION.address}</p>
            <p className="text-cocoa-muted text-sm">{LOCATION.hours}</p>
          </div>
        )}

        <p className="text-cocoa-muted mt-4 text-sm">
          To change or cancel, call or message us on{" "}
          <a href={`tel:${LOCATION.phone.replace(/\s/g, "")}`} className="text-brand-ink hover:underline">
            {LOCATION.phone}
          </a>
          .
        </p>

        <p className="mt-8 text-center">
          <Link href="/" className="text-brand-ink hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
