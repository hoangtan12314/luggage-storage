import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { getSizeConfig, ROOM } from "@/lib/config";
import { countAvailable, countRoomsAvailable } from "@/lib/data/bookings";
import { InvalidRangeError, quote, quoteRoom } from "@/lib/pricing";
import { noIndexMetadata } from "@/lib/seo";
import {
  encodeItems,
  roomSelectionSchema,
  selectionSchema,
} from "@/lib/validation";
import type { AnyQuote } from "@/lib/types";

// Contains guest personal details entered during checkout — must never be
// indexed. See also app/robots.ts, which disallows crawling this path.
export const metadata: Metadata = noIndexMetadata;

function Recovery({ message }: { message: string }) {
  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/70 bg-white/60 p-8 text-center shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-cocoa">
            That booking link isn&apos;t valid
          </h1>
          <p className="text-cocoa-muted mt-3">{message}</p>
          <Link
            href="/"
            className="bg-gold focus-visible:ring-ring mt-6 inline-flex min-h-12 items-center rounded-full px-6 text-[15px] font-medium text-cocoa shadow-sm transition-[filter] duration-200 outline-none hover:brightness-95 focus-visible:ring-2"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const raw = await props.searchParams;
  const kind = raw.kind === "room" ? "room" : "luggage";

  let priced: AnyQuote;
  let hidden: Record<string, string>;
  const shortages: string[] = [];
  let backHref = "/luggage";

  if (kind === "room") {
    const parsed = roomSelectionSchema.safeParse({
      checkIn: raw.checkIn,
      checkOut: raw.checkOut,
      quantity: raw.quantity,
    });

    if (!parsed.success) {
      return (
        <Recovery message="Please start again from the rooms page and choose your dates." />
      );
    }

    const { checkIn, checkOut, quantity } = parsed.data;

    try {
      priced = quoteRoom(checkIn, checkOut, quantity);
    } catch (err) {
      if (err instanceof InvalidRangeError) {
        return <Recovery message="Those dates are no longer valid." />;
      }
      throw err;
    }

    const available = await countRoomsAvailable(checkIn, checkOut);
    if (available < quantity) {
      shortages.push(
        available === 0
          ? `${ROOM.label} is fully booked for those dates.`
          : `Only ${available} room${available > 1 ? "s" : ""} left for those dates.`
      );
    }

    hidden = {
      kind: "room",
      checkIn,
      checkOut,
      quantity: String(quantity),
    };
    backHref = "/rooms";
  } else {
    const parsed = selectionSchema.safeParse({
      items: raw.items,
      start: raw.start,
      end: raw.end,
    });

    if (!parsed.success) {
      return (
        <Recovery message="Please start again from the luggage page and choose your lockers and times." />
      );
    }

    const { items, start, end } = parsed.data;

    try {
      priced = quote(items, start, end);
    } catch (err) {
      if (err instanceof InvalidRangeError) {
        return <Recovery message="That storage period is no longer valid." />;
      }
      throw err;
    }

    // Surface shortages before the customer fills the form; the action re-checks.
    for (const item of items) {
      const available = await countAvailable(item.size, start, end);
      if (available < item.quantity) {
        const label = getSizeConfig(item.size).label;
        shortages.push(
          available === 0
            ? `${label} lockers are fully booked for this period.`
            : `Only ${available} ${label} locker${available > 1 ? "s" : ""} left for this period.`
        );
      }
    }

    hidden = {
      kind: "luggage",
      items: encodeItems(items),
      start: priced.start,
      end: priced.end,
    };
  }

  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10 lg:pb-20">
        <Link
          href={backHref}
          className="text-cocoa-muted hover:text-cocoa inline-flex min-h-11 items-center gap-1.5 text-sm underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-cocoa lg:text-4xl">
          Your request
        </h1>
        <p className="text-cocoa-muted mt-2 mb-8 text-lg">
          Send us your request — no account needed. We’ll confirm with you, and you pay when you arrive.
        </p>

        <CheckoutForm
          hidden={hidden}
          total={priced.total}
          disabled={shortages.length > 0}
          backHref={backHref}
          summary={
            <>
              <OrderSummary quote={priced} />
              {shortages.length > 0 && (
                <div role="alert" className="text-destructive mt-4 space-y-1 text-sm">
                  {shortages.map((s) => (
                    <p key={s}>{s}</p>
                  ))}
                  <Link href={backHref} className="mt-1 inline-block underline">
                    Change your selection
                  </Link>
                </div>
              )}
            </>
          }
        />
      </div>
    </main>
  );
}
