"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SIZES } from "@/lib/config";
import { formatVnd } from "@/lib/money";
import { describeDuration, quote } from "@/lib/pricing";
import { encodeItems } from "@/lib/validation";
import type { BookingItem, LockerSize } from "@/lib/types";
import { cn } from "@/lib/utils";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultRange() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: toLocalInputValue(start), end: toLocalInputValue(end) };
}

function formatDayLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type BookingWidgetProps = {
  /** Lockers still free right now, per size. Re-checked server-side on submit. */
  availability?: Partial<Record<LockerSize, number>>;
};

export function BookingWidget({ availability }: BookingWidgetProps) {
  const router = useRouter();
  const initial = useMemo(() => defaultRange(), []);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [quantities, setQuantities] = useState<Record<LockerSize, number>>({
    small: 0,
    large: 1,
  });
  const [error, setError] = useState<string | null>(null);

  const items: BookingItem[] = useMemo(
    () =>
      SIZES.filter((s) => quantities[s.id] > 0).map((s) => ({
        size: s.id,
        quantity: quantities[s.id],
      })),
    [quantities]
  );

  const preview = useMemo(() => {
    if (items.length === 0) return null;
    const startIso = new Date(start).toISOString();
    const endIso = new Date(end).toISOString();
    try {
      return {
        quote: quote(items, startIso, endIso),
        duration: describeDuration(startIso, endIso),
      };
    } catch {
      return null;
    }
  }, [items, start, end]);

  function adjust(size: LockerSize, delta: number) {
    const max = availability?.[size] ?? Infinity;
    setQuantities((q) => ({
      ...q,
      [size]: Math.max(0, Math.min(max, q[size] + delta)),
    }));
    setError(null);
  }

  /** Clicking the card body toggles it between 0 and 1 — even from a
   * quantity set higher via the stepper, a click clears it to 0. */
  function toggle(size: LockerSize) {
    if (availability?.[size] === 0) return;
    setQuantities((q) => ({ ...q, [size]: q[size] > 0 ? 0 : 1 }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      setError("Choose at least one locker.");
      return;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please choose valid drop-off and pick-up times.");
      return;
    }
    if (endDate <= startDate) {
      setError("Pick-up must be after drop-off.");
      return;
    }

    const params = new URLSearchParams({
      items: encodeItems(items),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6"
      >
        {/* Rate strip — informational: the best rate is applied automatically. */}
        <div className="bg-muted/50 grid grid-cols-3 gap-1 rounded-xl border p-1 text-center">
          {(
            [
              ["Hourly", "hourly"],
              ["Daily", "daily"],
              ["Weekly", "weekly"],
            ] as const
          ).map(([label, key]) => (
            <div
              key={key}
              className={cn(
                "rounded-lg px-2 py-2",
                key === "weekly" && "bg-brand-muted"
              )}
            >
              <p className="text-xs font-semibold">
                {label}
                {key === "weekly" && (
                  <span className="text-brand ml-1 font-medium">· best value</span>
                )}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                from {formatVnd(SIZES[0][key])}
              </p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          We bill the cheapest combination automatically — no plan to choose.
        </p>

        {/* Size cards with quantity steppers */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SIZES.map((size) => {
            const qty = quantities[size.id];
            const available = availability?.[size.id];
            const soldOut = available === 0;

            return (
              <div
                key={size.id}
                className={cn(
                  "relative rounded-xl border-2 transition-colors",
                  qty > 0
                    ? "border-brand bg-brand-muted"
                    : "border-border bg-background hover:border-brand/50",
                  soldOut && "opacity-60"
                )}
              >
                {/* The ⓘ trigger is a sibling of the toggle button below, not a
                    child of it — a button can't nest another button, and this
                    way its clicks never reach the toggle. */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`What fits in a ${size.label} locker`}
                      className="text-muted-foreground hover:text-foreground absolute top-4 right-4 z-10"
                    >
                      <Info className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-56">
                    {size.fits}
                  </TooltipContent>
                </Tooltip>

                <button
                  type="button"
                  onClick={() => toggle(size.id)}
                  disabled={soldOut}
                  aria-pressed={qty > 0}
                  className="focus-visible:ring-ring w-full rounded-xl p-4 pr-10 text-left focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
                >
                  <Badge
                    variant={qty > 0 ? "default" : "secondary"}
                    className="uppercase"
                  >
                    {size.label}
                  </Badge>

                  <p className="mt-2 text-sm font-medium">{size.description}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatVnd(size.daily)}
                    <span className="text-muted-foreground text-xs font-normal">
                      {" "}
                      / day
                    </span>
                  </p>
                </button>

                <div className="px-4 pb-4">
                  {soldOut ? (
                    <p className="text-destructive text-sm font-medium">
                      Fully booked
                    </p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjust(size.id, -1)}
                        disabled={qty === 0}
                        aria-label={`Remove one ${size.label} locker`}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span
                        aria-live="polite"
                        className="w-8 text-center text-lg font-semibold tabular-nums"
                      >
                        {qty}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjust(size.id, 1)}
                        disabled={available !== undefined && qty >= available}
                        aria-label={`Add one ${size.label} locker`}
                      >
                        <Plus className="size-4" />
                      </Button>
                      {available !== undefined && available <= 3 && (
                        <span className="text-muted-foreground text-xs">
                          {available} left
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Period */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start"
              className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
            >
              Drop off
            </label>
            <input
              id="start"
              type="datetime-local"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setError(null);
              }}
              className="border-input bg-background focus-visible:ring-ring mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="end"
              className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
            >
              Pick up
            </label>
            <input
              id="end"
              type="datetime-local"
              value={end}
              min={start}
              onChange={(e) => {
                setEnd(e.target.value);
                setError(null);
              }}
              className="border-input bg-background focus-visible:ring-ring mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              required
            />
          </div>
        </div>

        {/* Live summary */}
        {preview && (
          <div className="border-brand bg-brand-muted mt-5 rounded-xl border-2 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-semibold">{preview.duration}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDayLabel(preview.quote.start)} —{" "}
                  {formatDayLabel(preview.quote.end)}
                </p>
              </div>
              <p className="text-brand text-xl font-bold">
                {formatVnd(preview.quote.total)}
              </p>
            </div>

            <div className="mt-3 space-y-2 border-t pt-3">
              {preview.quote.items.map((item) => (
                <div key={item.size} className="flex justify-between text-sm">
                  <span>
                    {SIZES.find((s) => s.id === item.size)?.label}
                    <span className="text-muted-foreground"> × {item.quantity}</span>
                  </span>
                  <span className="text-right">
                    {formatVnd(item.subtotal)}
                    <span className="text-muted-foreground block text-xs">
                      {item.lines
                        .map(
                          (l) =>
                            `${l.quantity} ${l.unit}${l.quantity > 1 ? "s" : ""}: ${formatVnd(l.unitPrice)}`
                        )
                        .join(" + ")}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-destructive mt-3 text-sm">{error}</p>}

        <Button type="submit" size="lg" className="mt-5 w-full">
          Continue To Your Details
        </Button>
      </form>
    </TooltipProvider>
  );
}
