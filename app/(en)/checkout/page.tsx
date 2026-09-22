import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { Card } from "@/components/ui/card";
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
    <main className="flex-1">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">That booking link isn&apos;t valid</h1>
        <p className="text-muted-foreground mt-2">{message}</p>
        <Link href="/" className="text-brand-ink mt-6 inline-block hover:underline">
          ← Back to home
        </Link>
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
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Guest checkout — no account needed. Pay when you arrive.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-5">
          <Card className="h-fit p-6 sm:col-span-2">
            <h2 className="mb-4 font-semibold">Order summary</h2>
            <OrderSummary quote={priced} />
            {shortages.length > 0 && (
              <div className="text-destructive mt-4 space-y-1 text-sm">
                {shortages.map((s) => (
                  <p key={s}>{s}</p>
                ))}
                <Link href={backHref} className="mt-1 inline-block underline">
                  Change your selection
                </Link>
              </div>
            )}
          </Card>

          <div className="sm:col-span-3">
            <Card className="p-6">
              <CheckoutForm
                hidden={hidden}
                total={priced.total}
                disabled={shortages.length > 0}
              />
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
