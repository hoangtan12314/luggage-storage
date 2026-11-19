import { getSizeConfig, ROOM } from "@/lib/config";
import { formatVnd } from "@/lib/money";
import { describeDuration } from "@/lib/pricing";
import type { AnyQuote } from "@/lib/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

/**
 * Itemized quote breakdown, shared by the checkout summary and the
 * confirmation page so the customer sees identical figures on both — for a
 * luggage stay, a room stay or a cooking class.
 */
export function OrderSummary({ quote }: { quote: AnyQuote }) {
  if (quote.kind === "class") {
    return (
      <div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-muted">Class</dt>
            <dd className="text-right">{quote.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-muted">Date</dt>
            <dd className="text-right">{formatDate(quote.date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-muted">Time</dt>
            <dd className="text-right">{quote.time}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-3 border-t border-cocoa/15 pt-4">
          <div className="flex justify-between gap-3 text-sm">
            <span className="whitespace-nowrap">
              {quote.people} {quote.people > 1 ? "people" : "person"}
            </span>
            <span className="min-w-0 text-right">
              {formatVnd(quote.total)}
              <span className="text-cocoa-muted block text-xs">
                {formatVnd(quote.pricePerPerson)} per person
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-cocoa/15 pt-4 font-semibold">
          <span>Total</span>
          <span className="text-brand-ink text-lg">{formatVnd(quote.total)}</span>
        </div>
      </div>
    );
  }

  if (quote.kind === "room") {
    return (
      <div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-muted">Check-in</dt>
            <dd className="text-right">{formatDate(quote.checkIn)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-muted">Check-out</dt>
            <dd className="text-right">{formatDate(quote.checkOut)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-cocoa-muted">Nights</dt>
            <dd className="text-right">{quote.nights}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-3 border-t border-cocoa/15 pt-4">
          <div className="flex justify-between gap-3 text-sm">
            <span className="whitespace-nowrap">
              {ROOM.label}
              <span className="text-cocoa-muted"> × {quote.quantity}</span>
            </span>
            <span className="min-w-0 text-right">
              {formatVnd(quote.total)}
              <span className="text-cocoa-muted block text-xs">
                {quote.nights} night{quote.nights > 1 ? "s" : ""}: {formatVnd(quote.nightlyRate)}
                {quote.quantity > 1 &&
                  ` · ${formatVnd(quote.nights * quote.nightlyRate)} each`}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-cocoa/15 pt-4 font-semibold">
          <span>Total</span>
          <span className="text-brand-ink text-lg">{formatVnd(quote.total)}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-cocoa-muted">Drop off</dt>
          <dd className="text-right">{formatDateTime(quote.start)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-cocoa-muted">Pick up</dt>
          <dd className="text-right">{formatDateTime(quote.end)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-cocoa-muted">Duration</dt>
          <dd className="text-right">{describeDuration(quote.start, quote.end)}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-3 border-t border-cocoa/15 pt-4">
        {quote.items.map((item) => (
          <div key={item.size} className="flex justify-between gap-3 text-sm">
            <span className="whitespace-nowrap">
              {getSizeConfig(item.size).label}
              <span className="text-cocoa-muted"> × {item.quantity}</span>
            </span>
            <span className="min-w-0 text-right">
              {formatVnd(item.subtotal)}
              <span className="text-cocoa-muted block text-xs">
                {item.lines
                  .map(
                    (l) =>
                      `${l.quantity} ${l.unit}${l.quantity > 1 ? "s" : ""}: ${formatVnd(l.unitPrice)}`
                  )
                  .join(" + ")}
                {item.quantity > 1 && ` · ${formatVnd(item.unitTotal)} each`}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between border-t border-cocoa/15 pt-4 font-semibold">
        <span>Total</span>
        <span className="text-brand-ink text-lg">{formatVnd(quote.total)}</span>
      </div>
    </div>
  );
}
