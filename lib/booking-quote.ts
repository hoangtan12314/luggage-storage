import { getWorkshop } from "./config";
import { quote, quoteClass, quoteRoom } from "./pricing";
import type { AnyQuote, Booking } from "./types";

/**
 * Re-derives the itemised breakdown from a stored booking, so every page shows
 * the same figures the guest saw at checkout. Classes quote from the price
 * stored on the booking, never today's config, so a later price edit can't
 * change a past booking.
 */
export function quoteForBooking(booking: Booking): AnyQuote {
  if (booking.kind === "class") {
    return quoteClass(
      {
        id: booking.workshopId ?? "",
        name: getWorkshop(booking.workshopId ?? "")?.name ?? "Cooking class",
        pricePerPerson: booking.unitPrice ?? 0,
      },
      booking.start,
      booking.classTime ?? "",
      booking.people ?? 1
    );
  }
  if (booking.kind === "room") {
    return quoteRoom(booking.start, booking.end, booking.roomQuantity ?? 1);
  }
  return quote(booking.items ?? [], booking.start, booking.end);
}
