"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, SearchX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClassAvailability } from "@/lib/class-actions";
import { classDateBounds } from "@/lib/class-dates";
import { CLASS_SEATS_PER_SESSION } from "@/lib/config";
import type { ClassesCopy, Locale } from "@/lib/i18n";
import { formatVnd } from "@/lib/money";
import { cn } from "@/lib/utils";

const subscribeNever = () => () => {};

export type AvailabilityOption = {
  id: string;
  name: string;
  pricePerPerson: number;
  availableTimes: string[];
};

type Props = {
  typeSlug: string;
  options: AvailabilityOption[];
  fromPrice: number;
  copy: ClassesCopy["availability"];
  locale: Locale;
  /** "" for English, "/vi" for Vietnamese. */
  base: string;
  phone: string;
};

type Check =
  | { key: string; state: "loading" }
  | { key: string; state: "error" }
  | { key: string; state: "ready"; seats: Record<string, number> };

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );

/**
 * The booking card on a class page, modelled on a tour-booking widget:
 * guests + date → "Check availability" → the type's options with start
 * times → pick one and continue to the reservation form.
 *
 * Results are keyed by type + date + guests. When the guest changes the date
 * or the number of guests the key no longer matches, so the card returns to
 * its idle state instead of showing options that were checked for something
 * else. Availability is advisory: createBooking re-checks seats on submit.
 */
export function AvailabilityCard({
  typeSlug,
  options,
  fromPrice,
  copy,
  locale,
  base,
  phone,
}: Props) {
  const router = useRouter();

  // "Tomorrow" depends on the visitor's clock (in the shop's timezone), so it
  // can't be baked into the statically generated page. Read on the client
  // only; "" during server render and hydration.
  const boundsKey = useSyncExternalStore(
    subscribeNever,
    () => {
      const b = classDateBounds();
      return `${b.min}|${b.max}`;
    },
    () => ""
  );
  const bounds = boundsKey
    ? { min: boundsKey.split("|")[0], max: boundsKey.split("|")[1] }
    : null;

  const [dateInput, setDateInput] = useState("");
  const [people, setPeople] = useState(1);
  const date = dateInput || bounds?.min || "";

  const key = `${typeSlug}|${date}|${people}`;
  const [check, setCheck] = useState<Check | null>(null);
  const [chosenState, setChosen] = useState<{
    key: string;
    optionId: string;
    time: string;
  } | null>(null);

  const current = check && check.key === key ? check : null;
  const chosen = chosenState && chosenState.key === key ? chosenState : null;

  const resultsRef = useRef<HTMLDivElement>(null);
  const resultState = current?.state;
  useEffect(() => {
    // Move focus to the results once they arrive so keyboard and
    // screen-reader users land on them. preventScroll + an explicit,
    // motion-aware scroll avoids the page jumping on desktop, where the
    // sticky card is already in view.
    if (resultState === "ready" || resultState === "error") {
      const el = resultsRef.current;
      el?.focus({ preventScroll: true });
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }
  }, [resultState]);

  function runCheck() {
    if (!date) return;
    const forKey = key;
    setCheck({ key: forKey, state: "loading" });
    getClassAvailability(typeSlug, date)
      .then((seats) => setCheck({ key: forKey, state: "ready", seats }))
      .catch(() => setCheck({ key: forKey, state: "error" }));
  }

  const dateLabel = date
    ? new Date(`${date}T00:00:00Z`).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      })
    : "";
  const guestsLabel =
    people === 1 ? copy.guestsOne : fill(copy.guestsMany, { n: people });

  const seats = current?.state === "ready" ? current.seats : null;
  const anyAvailable =
    !!seats &&
    options.some((o) => o.availableTimes.some((t) => (seats[t] ?? 0) >= people));

  function select() {
    if (!chosen) return;
    const params = new URLSearchParams({
      workshop: chosen.optionId,
      date,
      time: chosen.time,
      people: String(people),
    });
    router.push(`${base}/classes/reserve?${params.toString()}`);
  }

  const loading = current?.state === "loading";

  return (
    <div
      id="availability"
      className="border-gold/50 from-cream-2 scroll-mt-6 rounded-3xl border-2 bg-gradient-to-br to-white/70 p-5 shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)] sm:p-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
    >
      <p className="text-cocoa-muted text-sm">{copy.from}</p>
      <p className="text-brand-ink text-2xl font-bold tabular-nums">
        {formatVnd(fromPrice)}
        <span className="text-cocoa-muted ml-1.5 text-sm font-normal">{copy.perPerson}</span>
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <span id="avail-guests-label" className="text-cocoa block text-sm leading-none font-medium">
            {copy.guests}
          </span>
          <div className="mt-2 flex h-11 items-center gap-3">
            <Button
              type="button"
              variant="outline"
              aria-label={copy.removeGuest}
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
              disabled={people <= 1}
              className="size-11 cursor-pointer rounded-full"
            >
              <Minus className="size-4" />
            </Button>
            <span
              role="status"
              aria-labelledby="avail-guests-label"
              className="w-8 text-center text-lg font-semibold text-cocoa tabular-nums"
            >
              {people}
            </span>
            <Button
              type="button"
              variant="outline"
              aria-label={copy.addGuest}
              onClick={() => setPeople((p) => Math.min(CLASS_SEATS_PER_SESSION, p + 1))}
              disabled={people >= CLASS_SEATS_PER_SESSION}
              className="size-11 cursor-pointer rounded-full"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="avail-date" className="text-cocoa">
            {copy.date}
          </Label>
          <Input
            id="avail-date"
            type="date"
            value={date}
            min={bounds?.min}
            max={bounds?.max}
            onChange={(e) => setDateInput(e.target.value)}
            aria-describedby="avail-date-help"
            className="mt-1.5 h-11 rounded-xl border-cocoa/20 bg-white/80 px-3.5 text-base text-cocoa md:text-base"
          />
          <p id="avail-date-help" className="text-cocoa-muted mt-1.5 text-xs">
            {copy.dateHelp}
          </p>
        </div>

        <Button
          type="button"
          onClick={runCheck}
          disabled={!date || loading}
          aria-busy={loading}
          className="bg-gold hover:bg-gold h-12 w-full cursor-pointer rounded-full text-base font-medium text-cocoa shadow-sm transition-[filter] duration-200 hover:brightness-95"
        >
          {loading ? copy.checking : copy.check}
        </Button>
      </div>

      <div
        ref={resultsRef}
        tabIndex={-1}
        aria-live="polite"
        className="mt-5 outline-none empty:hidden"
      >
        {loading && (
          <div aria-hidden className="space-y-3">
            {options.map((o) => (
              <div
                key={o.id}
                className="h-44 animate-pulse rounded-2xl bg-cocoa/5 motion-reduce:animate-none"
              />
            ))}
          </div>
        )}

        {current?.state === "error" && (
          <div className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-2xl border p-4 text-sm">
            <TriangleAlert aria-hidden className="text-destructive mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-destructive font-medium">{copy.errorText}</p>
              <button
                type="button"
                onClick={runCheck}
                className="text-brand-ink mt-2 min-h-11 cursor-pointer font-medium underline underline-offset-2"
              >
                {copy.retry}
              </button>
            </div>
          </div>
        )}

        {seats && !anyAvailable && (
          <div className="rounded-2xl border border-cocoa/15 bg-white/60 p-4 text-sm">
            <SearchX aria-hidden className="text-cocoa-muted mb-2 size-6" />
            <p className="font-semibold text-cocoa">
              {fill(copy.noneTitle, { guests: guestsLabel, date: dateLabel })}
            </p>
            <p className="text-cocoa-muted mt-1.5">{fill(copy.noneHelp, { phone })}</p>
          </div>
        )}

        {seats && anyAvailable && (
          <>
            <h3 className="font-display text-lg font-semibold tracking-tight text-cocoa">
              {copy.chooseOption}
            </h3>
            <p className="text-cocoa-muted text-sm">
              {fill(copy.resultsFor, { date: dateLabel, guests: guestsLabel })}
            </p>

            <div className="mt-3 space-y-3">
              {options.map((option) => {
                const isChosen = chosen?.optionId === option.id;
                return (
                  <fieldset
                    key={option.id}
                    className={cn(
                      "rounded-2xl border bg-white/70 p-4 transition-colors duration-200",
                      isChosen ? "border-gold ring-2 ring-gold/50" : "border-cocoa/15"
                    )}
                  >
                    <legend className="sr-only">{option.name}</legend>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display font-semibold tracking-tight text-cocoa">
                        {option.name}
                      </p>
                      <p className="text-brand-ink shrink-0 text-sm font-semibold tabular-nums">
                        {formatVnd(option.pricePerPerson)}
                        <span className="text-cocoa-muted block text-right text-xs font-normal">
                          {copy.perPerson}
                        </span>
                      </p>
                    </div>

                    <p className="text-cocoa-muted mt-3 text-xs font-medium tracking-wide uppercase">
                      {copy.startTime}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {option.availableTimes.map((time) => {
                        const left = seats[time] ?? 0;
                        const enough = left >= people;
                        const checked = isChosen && chosen?.time === time;
                        const note =
                          left === 0
                            ? copy.full
                            : !enough
                              ? fill(copy.onlyLeft, { n: left })
                              : left === 1
                                ? copy.seatsLeftOne
                                : fill(copy.seatsLeftMany, { n: left });
                        return (
                          <label
                            key={time}
                            className={cn("relative", enough ? "cursor-pointer" : "cursor-not-allowed")}
                          >
                            <input
                              type="radio"
                              name="class-slot"
                              value={`${option.id}|${time}`}
                              checked={checked}
                              disabled={!enough}
                              onChange={() => setChosen({ key, optionId: option.id, time })}
                              className="peer sr-only"
                            />
                            <span className="peer-focus-visible:ring-ring/60 peer-checked:border-gold peer-checked:bg-gold/25 flex min-h-14 min-w-20 flex-col items-center justify-center rounded-xl border border-cocoa/25 bg-white/80 px-2.5 py-1.5 text-cocoa transition-colors duration-200 peer-focus-visible:ring-3 peer-disabled:opacity-50 hover:bg-white">
                              <span className="text-base font-semibold tabular-nums">{time}</span>
                              <span className="text-cocoa-muted text-[11px] leading-tight">{note}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-cocoa/10 pt-3">
                      <p className="text-sm whitespace-nowrap">
                        <span className="text-cocoa-muted">{copy.total} </span>
                        <span className="text-brand-ink text-base font-bold tabular-nums">
                          {formatVnd(option.pricePerPerson * people)}
                        </span>
                      </p>
                      <Button
                        type="button"
                        onClick={select}
                        disabled={!isChosen}
                        className="bg-gold hover:bg-gold h-11 min-w-0 cursor-pointer rounded-full px-5 text-sm font-medium text-cocoa shadow-sm transition-[filter] duration-200 hover:brightness-95"
                      >
                        {isChosen ? copy.select : copy.chooseTimeFirst}
                      </Button>
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
