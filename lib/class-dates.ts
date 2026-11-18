import { LOCATION } from "./config";

/** How far ahead a class can be reserved online. */
export const CLASS_MAX_DAYS_AHEAD = 90;

/**
 * Today's date as "YYYY-MM-DD" in the shop's timezone (not the visitor's or
 * the server's). Pure and isomorphic: the booking form uses it for the date
 * input's bounds and the server action for the authoritative check, so both
 * agree on what "tomorrow" means even when the server runs in UTC.
 */
export function todayInShopTimezone(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LOCATION.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Adds whole days to a "YYYY-MM-DD" date (calendar arithmetic, no DST). */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Earliest and latest bookable class dates. Same-day is by phone. */
export function classDateBounds(now: Date = new Date()) {
  const today = todayInShopTimezone(now);
  return {
    min: addDays(today, 1),
    max: addDays(today, CLASS_MAX_DAYS_AHEAD),
  };
}
