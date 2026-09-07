import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { Card } from "@/components/ui/card";
import { getSizeConfig } from "@/lib/config";
import { countAvailable } from "@/lib/data/bookings";
import { InvalidRangeError, quote } from "@/lib/pricing";
import { encodeItems, selectionSchema } from "@/lib/validation";

function Recovery({ message }: { message: string }) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">That booking link isn&apos;t valid</h1>
        <p className="text-muted-foreground mt-2">{message}</p>
        <Link href="/" className="text-brand mt-6 inline-block hover:underline">
          ← Start a new booking
        </Link>
      </div>
    </main>
  );
}

export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const raw = await props.searchParams;

  const parsed = selectionSchema.safeParse({
    items: raw.items,
    start: raw.start,
    end: raw.end,
  });

  if (!parsed.success) {
    return (
      <Recovery message="Please start again from the home page and choose your lockers and times." />
    );
  }

  const { items, start, end } = parsed.data;

  let priced;
  try {
    priced = quote(items, start, end);
  } catch (err) {
    if (err instanceof InvalidRangeError) {
      return <Recovery message="That storage period is no longer valid." />;
    }
    throw err;
  }

  // Surface shortages before the customer fills the form; the action re-checks.
  const shortages: string[] = [];
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

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Guest checkout — no account needed.
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
                <Link href="/" className="mt-1 inline-block underline">
                  Change your selection
                </Link>
              </div>
            )}
          </Card>

          <div className="sm:col-span-3">
            <Card className="p-6">
              <CheckoutForm
                items={encodeItems(items)}
                start={priced.start}
                end={priced.end}
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
