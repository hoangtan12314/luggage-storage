"use server";

import { getClassType } from "./config";

/**
 * The start times a class type runs on a date. Every time is always open —
 * there is no seat limit, the owner confirms each request by hand — so this
 * only validates the input and lists the type's times. Called when the guest
 * presses "Check availability" on a class page.
 *
 * A separate file from lib/actions.ts, which deliberately exports only
 * createBooking. "use server" files may export async functions only.
 */
export async function getClassAvailability(typeSlug: string, date: string): Promise<string[]> {
  const type = getClassType(typeSlug);
  if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return [];
  }
  return Array.from(new Set(type.options.flatMap((o) => o.availableTimes))).sort();
}
