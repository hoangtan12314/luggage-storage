"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROOM } from "@/lib/config";
import { formatVnd } from "@/lib/money";
import { nightsBetween, quoteRoom } from "@/lib/pricing";

function toLocalDateValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultRange() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);
  return {
    checkIn: toLocalDateValue(checkIn),
    checkOut: toLocalDateValue(checkOut),
  };
}

type RoomWidgetProps = {
  /** Rooms free tonight, as a rough up-front signal. Re-checked server-side on submit. */
  availability?: number;
};

export function RoomWidget({ availability }: RoomWidgetProps) {
  const router = useRouter();
  const initial = useMemo(() => defaultRange(), []);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const maxQuantity = availability ?? ROOM.inventory;

  const preview = useMemo(() => {
    try {
      return {
        quote: quoteRoom(checkIn, checkOut, quantity),
        nights: nightsBetween(checkIn, checkOut),
      };
    } catch {
      return null;
    }
  }, [checkIn, checkOut, quantity]);

  function adjust(delta: number) {
    setQuantity((q) => Math.max(1, Math.min(maxQuantity || 1, q + delta)));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      setError("Please choose check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    const params = new URLSearchParams({
      kind: "room",
      checkIn,
      checkOut,
      quantity: String(quantity),
    });
    router.push(`/checkout?${params.toString()}`);
  }

  const soldOut = availability === 0;

  return (
    <form
      id="book"
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-semibold">{ROOM.label}</p>
          <p className="text-muted-foreground text-sm">{ROOM.capacity}</p>
        </div>
        <p className="text-lg font-semibold">
          {formatVnd(ROOM.nightly)}
          <span className="text-muted-foreground text-xs font-normal"> / night</span>
        </p>
      </div>

      {soldOut && (
        <p className="text-destructive mt-3 text-sm font-medium">
          Fully booked tonight — try different dates below.
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="checkIn"
            className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
          >
            Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            min={toLocalDateValue(new Date())}
            onChange={(e) => {
              setCheckIn(e.target.value);
              setError(null);
            }}
            className="border-input bg-background focus-visible:ring-ring mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            required
          />
        </div>
        <div>
          <label
            htmlFor="checkOut"
            className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
          >
            Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setError(null);
            }}
            className="border-input bg-background focus-visible:ring-ring mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            required
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Rooms
        </span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => adjust(-1)}
            disabled={quantity <= 1}
            aria-label="Remove one room"
          >
            <Minus className="size-4" />
          </Button>
          <span
            aria-live="polite"
            className="w-8 text-center text-lg font-semibold tabular-nums"
          >
            {quantity}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => adjust(1)}
            disabled={quantity >= maxQuantity}
            aria-label="Add one room"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {preview && (
        <div className="border-brand bg-brand-muted mt-5 rounded-xl border-2 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-semibold">
                {preview.nights} night{preview.nights > 1 ? "s" : ""}
              </p>
              <p className="text-muted-foreground text-xs">
                {ROOM.label} × {quantity}
              </p>
            </div>
            <p className="text-brand-ink text-xl font-bold">
              {formatVnd(preview.quote.total)}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-destructive mt-3 text-sm">{error}</p>}

      <Button type="submit" size="lg" className="mt-5 w-full">
        Continue To Your Details
      </Button>

      <p className="text-muted-foreground mt-3 text-xs">
        Pay on arrival — no payment required to reserve.
      </p>
    </form>
  );
}
