"use client";

import { useActionState } from "react";
import { createBooking } from "@/lib/actions";
import { initialCreateBookingState } from "@/lib/booking-form-state";
import { formatVnd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";

type CheckoutFormProps = {
  /**
   * Selection carried as hidden fields, shaped for whichever kind of
   * booking this is — e.g. { kind: "luggage", items: "small:2", start,
   * end } or { kind: "room", checkIn, checkOut, quantity }. The form
   * doesn't need to understand the shape; lib/actions.ts branches on `kind`
   * server-side and re-validates everything regardless.
   */
  hidden: Record<string, string>;
  total: number;
  disabled?: boolean;
};

export function CheckoutForm({ hidden, total, disabled }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialCreateBookingState
  );

  return (
    <form action={formAction} className="space-y-4">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

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
        {pending ? "Processing…" : `Reserve — pay ${formatVnd(total)} on arrival`}
      </Button>

      <p className="text-muted-foreground text-xs">
        This is a demo checkout — no real payment is charged.
      </p>
    </form>
  );
}
