"use server";

import { getClassType } from "./config";
import { countSeatsAvailable } from "./data/bookings";

/**
 * Seats left per start time for one class type on one date, e.g.
 * { "09:00": 5, "11:00": 2 }. The options of a type share one pool of seats,
 * so this is per type, not per option. Called when the guest presses "Check
 * availability" on a class page. Advisory only: createBooking re-checks
 * authoritatively at submit.
 *
 * A separate file from lib/actions.ts, which deliberately exports only
 * createBooking. "use server" files may export async functions only.
 */
export async function getClassAvailability(
  typeSlug: string,
  date: string
): Promise<Record<string, number>> {
  const type = getClassType(typeSlug);
  if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {};
  }

  const times = Array.from(new Set(type.options.flatMap((o) => o.availableTimes))).sort();
  const entries = await Promise.all(
    times.map(
      async (time) => [time, await countSeatsAvailable(type.slug, date, time)] as const
    )
  );
  return Object.fromEntries(entries);
}
