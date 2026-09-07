"use client";

import { useActionState } from "react";
import { createBooking } from "@/lib/actions";
import { initialCreateBookingState } from "@/lib/booking-form-state";
import { formatVnd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";

type CheckoutFormProps = {
  /** Encoded selection, e.g. "small:2,large:1". */
  items: string;
  start: string;
  end: string;
  total: number;
  disabled?: boolean;
};

export function CheckoutForm({
  items,
  start,
  end,
  total,
  disabled,
}: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialCreateBookingState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="items" value={items} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="end" value={end} />

      <FormField
        label="Full name"
        name="name"
        errors={state.errors.name}
        autoComplete="name"
        required
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        errors={state.errors.email}
        autoComplete="email"
        required
      />
      <FormField
        label="Phone"
        name="phone"
        type="tel"
        errors={state.errors.phone}
        autoComplete="tel"
        required
      />

      {state.message && (
        <p aria-live="polite" className="text-destructive text-sm">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending || disabled}
        className="w-full"
      >
        {pending ? "Processing…" : `Pay ${formatVnd(total)}`}
      </Button>

      <p className="text-muted-foreground text-xs">
        This is a demo checkout — no real payment is charged.
      </p>
    </form>
  );
}
