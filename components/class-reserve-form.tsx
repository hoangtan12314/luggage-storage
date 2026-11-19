"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { MeetingPoint } from "@/components/meeting-point";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBooking } from "@/lib/actions";
import { initialCreateBookingState } from "@/lib/booking-form-state";
import type { ClassesCopy } from "@/lib/i18n";
import { formatVnd } from "@/lib/money";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-xl border-cocoa/20 bg-white/80 px-3.5 text-base text-cocoa md:text-base";

type FieldKey = "name" | "email" | "contact" | "notes";

export type ReserveSelection = {
  workshopId: string;
  date: string;
  time: string;
  people: number;
};

type Props = {
  copy: ClassesCopy["reserve"];
  openInMaps: string;
  selection: ReserveSelection;
  /** Everything the summary shows, already formatted for the page's language. */
  summary: {
    className: string;
    dateLabel: string;
    durationLabel: string;
    pricePerPerson: number;
    total: number;
    meetingAddress: string;
    meetingLabel?: string;
    meetingDetails?: string;
    changeHref: string;
  };
};

/**
 * The contact form for a class reservation. The class, date, time and number
 * of guests arrive from the availability step as a read-only selection;
 * createBooking re-validates all of it, re-prices and re-checks seats, so
 * nothing in the URL is trusted.
 *
 * The server action is dispatched manually instead of via <form action>:
 * React resets a form after its action runs, which would wipe everything the
 * guest typed whenever the server rejects the submission.
 */
export function ClassReserveForm({ copy, openInMaps, selection, summary }: Props) {
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialCreateBookingState
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");

  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [attempts, setAttempts] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  const clientErrors = useMemo(() => {
    const errors: Partial<Record<FieldKey, string>> = {};
    const e = copy.errors;
    if (name.trim().length < 2) errors.name = e.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = e.email;
    const hasPhone = phone.trim() !== "";
    const hasWhatsapp = whatsapp.trim() !== "";
    if (!hasPhone && !hasWhatsapp) errors.contact = e.contact;
    else {
      const bad = (v: string) => !/^\+?[\d\s().-]{7,20}$/.test(v.trim());
      if ((hasPhone && bad(phone)) || (hasWhatsapp && bad(whatsapp))) errors.contact = e.phone;
    }
    if (notes.trim().length > 500) errors.notes = e.notes;
    return errors;
  }, [name, email, phone, whatsapp, notes, copy.errors]);

  // After a submit attempt every error shows; before that only fields the
  // guest has already left. Server errors fill any gaps.
  const serverError = (key: string) => state.errors[key]?.[0];
  const errorFor = (key: FieldKey): string | undefined =>
    attempts > 0 || touched[key] ? (clientErrors[key] ?? serverError(key)) : undefined;

  const fieldErrors = (Object.keys(clientErrors) as FieldKey[])
    .map((key) => ({ key, message: errorFor(key) }))
    .filter((e): e is { key: FieldKey; message: string } => !!e.message);
  // Problems with the selection itself (a tampered URL, seats taken meanwhile)
  // have no field here, so show the server's message.
  const selectionError =
    ["workshopId", "date", "time", "people"].map(serverError).find(Boolean) ?? state.message;

  const hasSummary = fieldErrors.length > 0 || !!selectionError;
  const touch = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempts((n) => n + 1);
    if (Object.keys(clientErrors).length > 0) return;

    const data = new FormData();
    data.set("kind", "class");
    data.set("workshopId", selection.workshopId);
    data.set("date", selection.date);
    data.set("time", selection.time);
    data.set("people", String(selection.people));
    data.set("name", name);
    data.set("email", email);
    data.set("phone", phone);
    data.set("whatsapp", whatsapp);
    data.set("notes", notes);
    startTransition(() => formAction(data));
  }

  // Move focus to the error summary after a failed attempt (client or server).
  useEffect(() => {
    if (attempts > 0 && hasSummary) summaryRef.current?.focus();
    // Only when an attempt happens or the server answers, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, state]);

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
            hasSummary &&
              "border-destructive/40 bg-destructive/5 mb-6 rounded-2xl border p-4 text-sm"
          )}
        >
          {hasSummary && (
            <>
              <h3 className="text-destructive font-semibold">{copy.errors.summaryTitle}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {fieldErrors.map(({ key, message }) => (
                  <li key={key}>
                    <a
                      href={`#reserve-${key === "contact" ? "phone" : key}`}
                      className="text-destructive underline underline-offset-2"
                    >
                      {message}
                    </a>
                  </li>
                ))}
                {selectionError && <li>{selectionError}</li>}
              </ul>
            </>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="reserve-name" className="text-cocoa">
              {copy.name}
              <span className="text-cocoa-muted font-normal">({copy.required})</span>
            </Label>
            <Input
              id="reserve-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch("name")}
              autoComplete="name"
              aria-invalid={!!errorFor("name") || undefined}
              aria-describedby="reserve-name-error"
              className={cn("mt-1.5", fieldClass)}
              required
            />
            <FieldError id="reserve-name-error" message={errorFor("name")} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="reserve-email" className="text-cocoa">
              {copy.email}
              <span className="text-cocoa-muted font-normal">({copy.required})</span>
            </Label>
            <Input
              id="reserve-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch("email")}
              autoComplete="email"
              aria-invalid={!!errorFor("email") || undefined}
              aria-describedby="reserve-email-error"
              className={cn("mt-1.5", fieldClass)}
              required
            />
            <FieldError id="reserve-email-error" message={errorFor("email")} />
          </div>

          <div>
            <Label htmlFor="reserve-phone" className="text-cocoa">
              {copy.phone}
            </Label>
            <Input
              id="reserve-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => touch("contact")}
              autoComplete="tel"
              aria-invalid={!!contactError || undefined}
              aria-describedby="reserve-contact-help reserve-contact-error"
              className={cn("mt-1.5", fieldClass)}
            />
          </div>
          <div>
            <Label htmlFor="reserve-whatsapp" className="text-cocoa">
              {copy.whatsapp}
            </Label>
            <Input
              id="reserve-whatsapp"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onBlur={() => touch("contact")}
              autoComplete="off"
              aria-invalid={!!contactError || undefined}
              aria-describedby="reserve-contact-help reserve-contact-error"
              className={cn("mt-1.5", fieldClass)}
            />
          </div>
          <div className="-mt-2 sm:col-span-2">
            <p id="reserve-contact-help" className="text-cocoa-muted text-xs">
              {copy.contactHelp}
            </p>
            <FieldError id="reserve-contact-error" message={contactError} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="reserve-notes" className="text-cocoa">
              {copy.notes}
            </Label>
            <textarea
              id="reserve-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => touch("notes")}
              rows={3}
              maxLength={600}
              aria-invalid={!!errorFor("notes") || undefined}
              aria-describedby="reserve-notes-help reserve-notes-error"
              className="border-cocoa/20 focus-visible:border-ring focus-visible:ring-ring/50 mt-1.5 block w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-base text-cocoa outline-none focus-visible:ring-3"
            />
            <p id="reserve-notes-help" className="text-cocoa-muted mt-1.5 text-xs">
              {copy.notesHelp}
            </p>
            <FieldError id="reserve-notes-error" message={errorFor("notes")} />
          </div>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div
          aria-live="polite"
          className="border-gold/50 from-cream-2 rounded-3xl border-2 bg-gradient-to-br to-white/70 p-5 shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)] sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-semibold tracking-tight text-cocoa">
              {copy.summary.heading}
            </h3>
            <Link
              href={summary.changeHref}
              className="text-brand-ink focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full px-1 text-sm font-medium outline-none hover:underline focus-visible:ring-2"
            >
              {copy.change}
            </Link>
          </div>
          <p className="mt-1 font-medium text-cocoa">{summary.className}</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <SummaryRow label={copy.summary.date} value={summary.dateLabel} />
            <SummaryRow label={copy.summary.time} value={selection.time} />
            <SummaryRow label={copy.summary.duration} value={summary.durationLabel} />
            <SummaryRow
              label={copy.summary.guests}
              value={`${selection.people} × ${formatVnd(summary.pricePerPerson)}`}
              hint={copy.summary.perPerson}
            />
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-cocoa/15 pt-4">
            <span className="font-semibold text-cocoa">{copy.summary.total}</span>
            <span className="text-brand-ink text-2xl font-bold tabular-nums">
              {formatVnd(summary.total)}
            </span>
          </div>
          <p className="text-cocoa-muted mt-2 text-xs">{copy.summary.payOnArrival}</p>
        </div>

        <div>
          <p className="text-cocoa-muted mb-2 text-xs font-medium tracking-wide uppercase">
            {copy.summary.meetingPoint}
          </p>
          <MeetingPoint
            address={summary.meetingAddress}
            label={summary.meetingLabel}
            details={summary.meetingDetails}
            openInMaps={openInMaps}
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="bg-gold hover:bg-gold h-12 w-full cursor-pointer rounded-full text-base font-medium text-cocoa shadow-sm transition-[filter] duration-200 hover:brightness-95"
        >
          {pending ? copy.submitting : copy.submit.replace("{total}", formatVnd(summary.total))}
        </Button>
      </aside>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="text-destructive mt-1.5 text-sm">
      {message}
    </p>
  );
}

function SummaryRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-cocoa-muted">{label}</dt>
      <dd className="text-right font-medium text-cocoa">
        {value}
        {hint && <span className="text-cocoa-muted block text-xs font-normal">{hint}</span>}
      </dd>
    </div>
  );
}
