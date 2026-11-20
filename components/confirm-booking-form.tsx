"use client";

import { useActionState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { confirmBooking } from "@/lib/confirm-actions";
import type { ConfirmState } from "@/lib/confirm-actions";
import { Button } from "@/components/ui/button";

const initial: ConfirmState = { status: "idle", message: "" };

/** The owner's one-click "confirm" — emails the guest. See lib/confirm-actions.ts. */
export function ConfirmBookingForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, pending] = useActionState(confirmBooking, initial);

  if (state.status === "sent") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-gold/50 bg-gold/15 p-4 text-cocoa">
        <CheckCircle2 aria-hidden className="text-brand-ink mt-0.5 size-6 shrink-0" />
        <div>
          <p className="font-semibold">Confirmed — email sent</p>
          <p className="text-cocoa-muted mt-1 text-sm">{state.message}</p>
          <p className="text-cocoa-muted mt-1 text-xs">
            Please don&apos;t press confirm again, or the guest will get the email twice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      {state.status === "error" && (
        <div role="alert" className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-2xl border p-4 text-sm">
          <TriangleAlert aria-hidden className="text-destructive mt-0.5 size-5 shrink-0" />
          <p className="text-destructive">{state.message}</p>
        </div>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="bg-gold hover:bg-gold h-12 w-full cursor-pointer rounded-full text-base font-medium text-cocoa shadow-sm transition-[filter] duration-200 hover:brightness-95"
      >
        {pending ? "Sending…" : "Confirm & email the guest"}
      </Button>
      <p className="text-cocoa-muted text-xs">
        Sends a &ldquo;you&apos;re confirmed, see you soon&rdquo; email to {email}. Only press it after you have
        agreed the booking with them.
      </p>
    </form>
  );
}
