import { getSizeConfig } from "@/lib/config";
import { formatVnd } from "@/lib/money";
import { describeDuration } from "@/lib/pricing";
import type { Quote } from "@/lib/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Itemized quote breakdown, shared by the checkout summary and the
 * confirmation page so the customer sees identical figures on both.
 */
export function OrderSummary({ quote }: { quote: Quote }) {
  return (
    <div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Drop off</dt>
          <dd className="text-right">{formatDateTime(quote.start)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Pick up</dt>
          <dd className="text-right">{formatDateTime(quote.end)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="text-right">{describeDuration(quote.start, quote.end)}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-3 border-t pt-4">
        {quote.items.map((item) => (
          <div key={item.size} className="flex justify-between gap-3 text-sm">
            <span className="whitespace-nowrap">
              {getSizeConfig(item.size).label}
              <span className="text-muted-foreground"> × {item.quantity}</span>
            </span>
            <span className="min-w-0 text-right">
              {formatVnd(item.subtotal)}
              <span className="text-muted-foreground block text-xs">
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

      <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
        <span>Total</span>
        <span className="text-brand text-lg">{formatVnd(quote.total)}</span>
      </div>
    </div>
  );
}
