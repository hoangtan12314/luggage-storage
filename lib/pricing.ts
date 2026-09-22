import { getSizeConfig, ROOM } from "./config";
import type {
  BookingItem,
  LockerSize,
  Quote,
  QuotedItem,
  QuoteLine,
  RoomQuote,
} from "./types";

const MS_PER_HOUR = 1000 * 60 * 60;
const HOURS_PER_DAY = 24;
const HOURS_PER_WEEK = 24 * 7;

export class InvalidRangeError extends Error {}

function billableHours(start: string, end: string): number {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new InvalidRangeError("start/end must be valid ISO 8601 dates");
  }
  if (endMs <= startMs) {
    throw new InvalidRangeError("end must be after start");
  }

  return Math.ceil((endMs - startMs) / MS_PER_HOUR);
}

/**
 * Prices a single locker by billing the cheapest combination of week / day /
 * hour blocks that covers the full duration, rounding up any partial hour.
 *
 * With the shop's rates this is a real saving rather than bookkeeping: a week
 * costs 299,000 against 350,000 for seven separate days, and a day costs
 * 50,000 against 240,000 for twenty-four separate hours.
 */
export function quoteItem(
  size: LockerSize,
  start: string,
  end: string
): { lines: QuoteLine[]; unitTotal: number } {
  const config = getSizeConfig(size);
  let remainingHours = billableHours(start, end);

  const lines: QuoteLine[] = [];

  const weeks = Math.floor(remainingHours / HOURS_PER_WEEK);
  if (weeks > 0) {
    lines.push({
      unit: "week",
      quantity: weeks,
      unitPrice: config.weekly,
      subtotal: weeks * config.weekly,
    });
    remainingHours -= weeks * HOURS_PER_WEEK;
  }

  const days = Math.floor(remainingHours / HOURS_PER_DAY);
  if (days > 0) {
    lines.push({
      unit: "day",
      quantity: days,
      unitPrice: config.daily,
      subtotal: days * config.daily,
    });
    remainingHours -= days * HOURS_PER_DAY;
  }

  if (remainingHours > 0) {
    lines.push({
      unit: "hour",
      quantity: remainingHours,
      unitPrice: config.hourly,
      subtotal: remainingHours * config.hourly,
    });
  }

  const unitTotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return { lines, unitTotal };
}

/**
 * Prices a whole selection (several lockers, possibly of different sizes) for
 * one period.
 *
 * Pure and dependency-free: safe to call from both the client (live price
 * preview in the booking widget) and the server (authoritative price at
 * checkout).
 */
export function quote(
  items: BookingItem[],
  start: string,
  end: string
): Quote {
  if (items.length === 0) {
    throw new InvalidRangeError("select at least one locker");
  }

  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  // Validate the range once up front so an empty-items quote still throws
  // consistently rather than depending on the first item.
  billableHours(start, end);

  const quoted: QuotedItem[] = items.map((item) => {
    if (item.quantity < 1) {
      throw new InvalidRangeError("quantity must be at least 1");
    }
    const { lines, unitTotal } = quoteItem(item.size, start, end);
    return {
      size: item.size,
      quantity: item.quantity,
      lines,
      unitTotal,
      subtotal: unitTotal * item.quantity,
    };
  });

  return {
    kind: "luggage",
    items: quoted,
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
    total: quoted.reduce((sum, item) => sum + item.subtotal, 0),
    currency: "VND",
  };
}

/** Human-readable duration, e.g. "2 days", "1 week 3 days", "5 hours". */
export function describeDuration(start: string, end: string): string {
  let hours = billableHours(start, end);

  const weeks = Math.floor(hours / HOURS_PER_WEEK);
  hours -= weeks * HOURS_PER_WEEK;
  const days = Math.floor(hours / HOURS_PER_DAY);
  hours -= days * HOURS_PER_DAY;

  const parts: string[] = [];
  if (weeks) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);

  return parts.join(" ");
}

/**
 * Nights between two "YYYY-MM-DD" dates. Room dates are date-only (not full
 * ISO instants like luggage's start/end) — the widget uses plain date
 * pickers, and normalizing to the shop's actual check-in/out clock times
 * (ROOM.checkInTime/checkOutTime) is deferred to the pricing backend; for
 * now this is calendar nights, computed in UTC to sidestep timezone edge
 * cases in a date-only diff.
 */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const inMs = Date.parse(`${checkIn}T00:00:00Z`);
  const outMs = Date.parse(`${checkOut}T00:00:00Z`);

  if (Number.isNaN(inMs) || Number.isNaN(outMs)) {
    throw new InvalidRangeError("checkIn/checkOut must be valid dates");
  }
  if (outMs <= inMs) {
    throw new InvalidRangeError("checkOut must be after checkIn");
  }

  return Math.round((outMs - inMs) / (MS_PER_HOUR * HOURS_PER_DAY));
}

/**
 * Prices a room stay: nights × nightly rate × quantity. No cheapest-
 * combination billing here — rooms only have one rate, unlike lockers'
 * hour/day/week tiers.
 */
export function quoteRoom(
  checkIn: string,
  checkOut: string,
  quantity: number
): RoomQuote {
  if (quantity < 1) {
    throw new InvalidRangeError("quantity must be at least 1");
  }

  const nights = nightsBetween(checkIn, checkOut);

  return {
    kind: "room",
    checkIn,
    checkOut,
    nights,
    quantity,
    nightlyRate: ROOM.nightly,
    total: nights * ROOM.nightly * quantity,
    currency: "VND",
  };
}
