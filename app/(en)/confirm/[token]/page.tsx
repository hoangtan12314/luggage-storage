import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmBookingForm } from "@/components/confirm-booking-form";
import { OrderSummary } from "@/components/order-summary";
import { quoteForBooking } from "@/lib/booking-quote";
import { verifyBookingToken } from "@/lib/confirm-token";
import { noIndexMetadata } from "@/lib/seo";

// Owner-only page: the signed link in the new-request email. Never indexed
// (also disallowed in app/robots.ts).
export const metadata: Metadata = noIndexMetadata;

const card =
  "rounded-3xl border border-white/70 bg-white/60 p-6 text-cocoa shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]";

export default async function ConfirmBookingPage(props: PageProps<"/confirm/[token]">) {
  const { token } = await props.params;
  const booking = verifyBookingToken(token);

  if (!booking) {
    return (
      <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
        <div className="mx-auto max-w-xl px-4 pt-10 pb-20">
          <div className={`${card} text-center`}>
            <h1 className="font-display text-2xl font-semibold tracking-tight">This confirm link isn&apos;t valid</h1>
            <p className="text-cocoa-muted mt-3">
              It may have been copied incompletely, or the site&apos;s BOOKING_CONFIRM_SECRET has changed since the
              email was sent.
            </p>
            <Link href="/" className="text-brand-ink mt-4 inline-block hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { customer } = booking;
  const kind = booking.kind === "class" ? "class" : booking.kind === "room" ? "room" : "luggage";

  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <div className="mx-auto max-w-xl px-4 pt-10 pb-20">
        <p className="text-brand-ink text-sm font-medium tracking-wide uppercase">Booking request · {kind}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-cocoa">
          <span className="font-mono">{booking.ref}</span>
        </h1>

        <div className={`${card} mt-6`}>
          <h2 className="font-display text-lg font-semibold tracking-tight">Guest</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-muted">Name</dt>
              <dd className="text-right">{customer.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-muted">Email</dt>
              <dd className="text-right">{customer.email}</dd>
            </div>
            {customer.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-cocoa-muted">Phone</dt>
                <dd className="text-right">{customer.phone}</dd>
              </div>
            )}
            {customer.whatsapp && (
              <div className="flex justify-between gap-4">
                <dt className="text-cocoa-muted">WhatsApp</dt>
                <dd className="text-right">{customer.whatsapp}</dd>
              </div>
            )}
            {booking.notes && (
              <div className="flex justify-between gap-4">
                <dt className="text-cocoa-muted">Notes</dt>
                <dd className="text-right whitespace-pre-line">{booking.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className={`${card} mt-4`}>
          <h2 className="font-display mb-3 text-lg font-semibold tracking-tight">Request</h2>
          <OrderSummary quote={quoteForBooking(booking)} />
        </div>

        <div className="mt-6">
          <ConfirmBookingForm token={token} email={customer.email} />
        </div>
      </div>
    </main>
  );
}
