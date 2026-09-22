import { SIZES } from "./config";
import { countAvailable, countRoomsAvailable } from "./data/bookings";
import type { LockerSize } from "./types";

/**
 * Lockers free in the next 24h, per size — shown on the home page so a
 * sold-out size is visible up front. Shared by both the English and
 * Vietnamese home pages. The booking action re-checks authoritatively for
 * the customer's actual chosen period at submit time.
 */
export async function getNextDayAvailability(): Promise<
  Partial<Record<LockerSize, number>>
> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const availability: Partial<Record<LockerSize, number>> = {};
  for (const size of SIZES) {
    availability[size.id] = await countAvailable(
      size.id,
      now.toISOString(),
      tomorrow.toISOString()
    );
  }
  return availability;
}

/**
 * Rooms free tonight, as a rough up-front signal on the rooms page — the
 * same "next 24h" heuristic getNextDayAvailability uses for lockers. The
 * booking action re-checks the customer's actual chosen dates authoritatively
 * at submit.
 */
export async function getTonightRoomAvailability(): Promise<number> {
  const now = new Date();
  const tonight = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return countRoomsAvailable(tonight, tomorrow);
}
