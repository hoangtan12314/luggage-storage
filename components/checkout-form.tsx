"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { createBooking } from "@/lib/actions";
import { initialCreateBookingState } from "@/lib/booking-form-state";
import { formatVnd } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/components/phone-field";
import { Label } from "@/components/ui/label";
import { RequestNotice } from "@/components/request-notice";

const fieldClass =
  "mt-1.5 h-11 rounded-xl border-cocoa/20 bg-white/80 px-3.5 text-base text-cocoa md:text-base";

type FieldKey = "name" | "email" | "contact";

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
  /** The order summary (server-rendered), shown beside the form. */
  summary: React.ReactNode;
  /** Where "Change" sends the guest to adjust their selection. */
  backHref: string;
};

/**
 * Guest details for a luggage or room reservation, with the order summary and
 * the submit button in a sticky card beside it (below on mobile).
 *
 * The server action is dispatched manually rather than via <form action>:
 * React resets a form after its action runs, which would wipe everything the
 * guest typed whenever the server rejects it. Errors are summarised at the top
 * (focused after a failed attempt, each linking to its field) and repeated
 * inline; nothing shows before the guest leaves a field or tries to submit.
 */
export function CheckoutForm({ hidden, total, disabled, summary, backHref }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialCreateBookingState
  );

  const [values, setValues] = useState({ name: "", email: "", phone: "", whatsapp: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [attempts, setAttempts] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  const clientErrors = useMemo(() => {
    const errors: Partial<Record<FieldKey, string>> = {};
    if (values.name.trim().length < 2) errors.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      errors.email = "Please enter a valid email address.";
    const phone = values.phone.trim();
    const whatsapp = values.whatsapp.trim();
    const bad = (v: string) => !/^\+?[\d\s().-]{7,20}$/.test(v);
    if (!phone && !whatsapp) errors.contact = "Please enter a phone number or a WhatsApp number.";
    else if ((phone && bad(phone)) || (whatsapp && bad(whatsapp)))
      errors.contact = "Please enter a valid number, with the country code if it’s not Vietnamese.";
    return errors;
  }, [values]);

  const serverError = (key: string) => state.errors[key]?.[0];
  const errorFor = (key: FieldKey): string | undefined =>
    attempts > 0 || touched[key] ? (clientErrors[key] ?? serverError(key)) : undefined;

  const fieldErrors = (Object.keys(clientErrors) as FieldKey[])
    .map((key) => ({ key, message: errorFor(key) }))
    .filter((e): e is { key: FieldKey; message: string } => !!e.message);
  // Problems with the selection itself (no stock left, a tampered link) have no field.
  const selectionError = state.message;
  const hasSummary = fieldErrors.length > 0 || !!selectionError;

  const set = (key: "name" | "email" | "phone" | "whatsapp") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const touch = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempts((n) => n + 1);
    if (Object.keys(clientErrors).length > 0) return;

    const data = new FormData();
    for (const [name, value] of Object.entries(hidden)) data.set(name, value);
    data.set("name", values.name);
    data.set("email", values.email);
    data.set("phone", values.phone);
    data.set("whatsapp", values.whatsapp);
    startTransition(() => formAction(data));
  }

  // Move focus to the error summary after a failed attempt (client or server).
  useEffect(() => {
    if (attempts > 0 && hasSummary) summaryRef.current?.focus();
    // Only when an attempt happens or the server answers, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, state]);

  const fields: { key: "name" | "email"; label: string; type?: string; auto: string }[] = [
    { key: "name", label: "Full name", auto: "name" },
    { key: "email", label: "Email", type: "email", auto: "email" },
  ];
  const contactError = errorFor("contact");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending}
      className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start"
    >
      <div className="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)] sm:p-7">
        <div
          ref={summaryRef}
          tabIndex={-1}
          role={hasSummary ? "alert" : undefined}
          className={cn(
            "outline-none",
            hasSummary && "border-destructive/40 bg-destructive/5 mb-6 rounded-2xl border p-4 text-sm"
          )}
        >
          {hasSummary && (
            <>
              <h3 className="text-destructive font-semibold">There is a problem</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {fieldErrors.map(({ key, message }) => (
                  <li key={key}>
                    <a href={`#checkout-${key}`} className="text-destructive underline underline-offset-2">
                      {message}
                    </a>
                  </li>
                ))}
                {selectionError && <li>{selectionError}</li>}
              </ul>
            </>
          )}
        </div>

        <RequestNotice title="You’re placing a request">
          This isn’t a confirmed booking yet. We’ll contact you on WhatsApp (or by phone) at the number below to
          confirm, then email you to say we’ll see you soon. You pay on arrival.
        </RequestNotice>

        <h2 className="font-display mt-6 text-xl font-semibold tracking-tight text-cocoa">Your details</h2>
        <div className="mt-5 space-y-5">
          {fields.map(({ key, label, type, auto }) => {
            const error = errorFor(key);
            return (
              <div key={key}>
                <Label htmlFor={`checkout-${key}`} className="text-cocoa">
                  {label}
                  <span className="text-cocoa-muted font-normal">(required)</span>
                </Label>
                <Input
                  id={`checkout-${key}`}
                  type={type}
                  value={values[key]}
                  onChange={set(key)}
                  onBlur={() => touch(key)}
                  autoComplete={auto}
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? `checkout-${key}-error` : undefined}
                  className={fieldClass}
                  required
                />
                {error && (
                  <p id={`checkout-${key}-error`} className="text-destructive mt-1.5 text-sm">
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          <div className="space-y-3">
            {(
              [
                { key: "phone", label: "Phone", auto: "tel" },
                { key: "whatsapp", label: "WhatsApp", auto: "tel" },
              ] as const
            ).map(({ key, label, auto }) => (
              <div key={key}>
                <Label htmlFor={key === "phone" ? "checkout-contact" : `checkout-${key}`} className="text-cocoa">
                  {label}
                </Label>
                <PhoneField
                  id={key === "phone" ? "checkout-contact" : `checkout-${key}`}
                  label={label}
                  onChange={(full) => setValues((v) => ({ ...v, [key]: full }))}
                  onBlur={() => touch("contact")}
                  autoComplete={auto}
                  invalid={!!contactError}
                  describedBy="checkout-contact-help checkout-contact-error"
                />
              </div>
            ))}
            <p id="checkout-contact-help" className="text-cocoa-muted text-xs">
              Enter at least one — a WhatsApp number is best, it’s how we’ll reach you. Pick the country code
              before the number.
            </p>
            {contactError && (
              <p id="checkout-contact-error" className="text-destructive text-sm">
                {contactError}
              </p>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="border-gold/50 from-cream-2 rounded-3xl border-2 bg-gradient-to-br to-white/70 p-5 text-cocoa shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">Order summary</h2>
            <Link
              href={backHref}
              className="text-brand-ink focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full px-1 text-sm font-medium outline-none hover:underline focus-visible:ring-2"
            >
              Change
            </Link>
          </div>
          <div className="mt-3">{summary}</div>
          <p className="text-cocoa-muted mt-3 text-xs">Pay on arrival — nothing is charged online.</p>
        </div>

        <Button
          type="submit"
          disabled={pending || disabled}
          className="bg-gold hover:bg-gold h-12 w-full cursor-pointer rounded-full text-base font-medium text-cocoa shadow-sm transition-[filter] duration-200 hover:brightness-95"
        >
          {pending ? (
            "Processing…"
          ) : (
            <>
              Send request — pay {formatVnd(total)} on arrival
              <ArrowRight aria-hidden className="size-5" />
            </>
          )}
        </Button>
      </aside>
    </form>
  );
}
