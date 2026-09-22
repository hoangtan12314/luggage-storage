import { getSizeConfig, ROOM } from "../config";
import type { Booking, LockerSize } from "../types";

// A plain module-level Map would be wiped on every dev HMR reload (each edit
// re-evaluates this module). Pinning it to globalThis makes bookings survive
// hot reloads within the same process, matching how a real datastore would
// behave from the app's point of view.
const store = globalThis as unknown as { __bookings?: Map<string, Booking> };

function bookings(): Map<string, Booking> {
  if (!store.__bookings) {
    store.__bookings = new Map();
  }
  return store.__bookings;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Narrow repository surface. All methods are async even though nothing here
 * awaits, so the signatures don't change when a real database (Prisma,
 * Drizzle, ...) replaces this in-memory implementation.
 */
export async function createBooking(
  input: Omit<Booking, "createdAt">
): Promise<Booking> {
  const booking: Booking = { ...input, createdAt: new Date().toISOString() };
  bookings().set(booking.ref, booking);
  return booking;
}

export async function findByRef(ref: string): Promise<Booking | null> {
  return bookings().get(ref) ?? null;
}

export async function findOverlapping(
  size: LockerSize,
  start: string,
  end: string
): Promise<Booking[]> {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  return Array.from(bookings().values()).filter(
    (b) =>
      b.kind === "luggage" &&
      b.items?.some((i) => i.size === size) &&
      overlaps(startMs, endMs, Date.parse(b.start), Date.parse(b.end))
  );
}

/**
 * Lockers of `size` still free across the whole period.
 *
 * Counts *lockers*, not bookings: one booking row can hold several lockers of
 * the same size, so quantities must be summed rather than rows counted.
 */
export async function countAvailable(
  size: LockerSize,
  start: string,
  end: string
): Promise<number> {
  const { inventory } = getSizeConfig(size);
  const overlapping = await findOverlapping(size, start, end);

  const taken = overlapping
    .flatMap((b) => b.items ?? [])
    .filter((i) => i.size === size)
    .reduce((n, i) => n + i.quantity, 0);

  return Math.max(0, inventory - taken);
}

/**
 * Room bookings overlapping a check-in/check-out range. Dates are
 * "YYYY-MM-DD" (see lib/pricing.ts nightsBetween), so this compares them the
 * same way as the luggage overlap check, just on date strings parsed as
 * UTC midnight instead of full ISO instants.
 */
export async function findOverlappingRooms(
  checkIn: string,
  checkOut: string
): Promise<Booking[]> {
  const inMs = Date.parse(`${checkIn}T00:00:00Z`);
  const outMs = Date.parse(`${checkOut}T00:00:00Z`);
  return Array.from(bookings().values()).filter(
    (b) =>
      b.kind === "room" &&
      overlaps(
        inMs,
        outMs,
        Date.parse(`${b.start}T00:00:00Z`),
        Date.parse(`${b.end}T00:00:00Z`)
      )
  );
}

/**
 * Rooms still free across the whole check-in/check-out period. Sums
 * `roomQuantity` across overlapping bookings rather than counting rows, for
 * the same reason lockers do — one booking can hold more than one room.
 */
export async function countRoomsAvailable(
  checkIn: string,
  checkOut: string
): Promise<number> {
  const overlapping = await findOverlappingRooms(checkIn, checkOut);
  const taken = overlapping.reduce((n, b) => n + (b.roomQuantity ?? 0), 0);
  return Math.max(0, ROOM.inventory - taken);
}
