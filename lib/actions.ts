"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSizeConfig, ROOM } from "./config";
import {
  countAvailable,
  countRoomsAvailable,
  createBooking as createBookingRecord,
} from "./data/bookings";
import { notificationProvider } from "./notifications";
import { paymentProvider } from "./payments";
import { quote, quoteRoom, InvalidRangeError } from "./pricing";
import { generateRef } from "./reference";
import {
  customerSchema,
  roomSelectionSchema,
  selectionSchema,
} from "./validation";
import type { CreateBookingState } from "./booking-form-state";

/**
 * Server Action backing both checkout forms (luggage and room). Server
 * Actions are reachable via direct POST, not only through the UI that
 * renders this form — so every input is re-validated, re-priced, and
 * re-checked here rather than trusted from the client, for both kinds.
 */
export async function createBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const kind = formData.get("kind") === "room" ? "room" : "luggage";

  const customerResult = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (kind === "room") {
    return createRoomBooking(formData, customerResult);
  }
  return createLuggageBooking(formData, customerResult);
}

type CustomerResult = ReturnType<typeof customerSchema.safeParse>;

async function createLuggageBooking(
  formData: FormData,
  customerResult: CustomerResult
): Promise<CreateBookingState> {
  const selectionResult = selectionSchema.safeParse({
    items: formData.get("items"),
    start: formData.get("start"),
    end: formData.get("end"),
  });

  if (!selectionResult.success || !customerResult.success) {
    return {
      errors: {
        ...(selectionResult.success
          ? {}
          : z.flattenError(selectionResult.error).fieldErrors),
        ...(customerResult.success
          ? {}
          : z.flattenError(customerResult.error).fieldErrors),
      } as Record<string, string[]>,
      message: selectionResult.success
        ? "Please fix the errors below and try again."
        : "That booking link is no longer valid. Please start again.",
    };
  }

  const { items, start, end } = selectionResult.data;
  const customer = customerResult.data;

  // Re-price server-side from the validated selection. Any client-supplied
  // price is ignored entirely — it never reaches this function.
  let priced;
  try {
    priced = quote(items, start, end);
  } catch (err) {
    if (err instanceof InvalidRangeError) {
      return {
        errors: {},
        message: "That date range is no longer valid. Please start over.",
      };
    }
    throw err;
  }

  // Authoritative availability check, per size — stock may have changed since
  // the booking widget rendered.
  for (const item of items) {
    const available = await countAvailable(item.size, start, end);
    if (available < item.quantity) {
      const label = getSizeConfig(item.size).label;
      return {
        errors: {},
        message:
          available === 0
            ? `Sorry, ${label} lockers are fully booked for that time. Please choose another size or time.`
            : `Only ${available} ${label} locker${available > 1 ? "s" : ""} left for that time. Please reduce the quantity.`,
      };
    }
  }

  const ref = generateRef();
  const charge = await paymentProvider.charge(priced.total, priced.currency, ref);

  if (!charge.ok) {
    return { errors: {}, message: charge.error };
  }

  const booking = await createBookingRecord({
    ref,
    kind: "luggage",
    items,
    start: priced.start,
    end: priced.end,
    total: priced.total,
    currency: priced.currency,
    customer,
    transactionId: charge.transactionId,
  });

  await notify(booking);
  redirect(`/booking/${ref}`);
}

async function createRoomBooking(
  formData: FormData,
  customerResult: CustomerResult
): Promise<CreateBookingState> {
  const selectionResult = roomSelectionSchema.safeParse({
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    quantity: formData.get("quantity"),
  });

  if (!selectionResult.success || !customerResult.success) {
    return {
      errors: {
        ...(selectionResult.success
          ? {}
          : z.flattenError(selectionResult.error).fieldErrors),
        ...(customerResult.success
          ? {}
          : z.flattenError(customerResult.error).fieldErrors),
      } as Record<string, string[]>,
      message: selectionResult.success
        ? "Please fix the errors below and try again."
        : "That booking link is no longer valid. Please start again.",
    };
  }

  const { checkIn, checkOut, quantity } = selectionResult.data;
  const customer = customerResult.data;

  let priced;
  try {
    priced = quoteRoom(checkIn, checkOut, quantity);
  } catch (err) {
    if (err instanceof InvalidRangeError) {
      return {
        errors: {},
        message: "Those dates are no longer valid. Please start over.",
      };
    }
    throw err;
  }

  // Authoritative availability check — stock may have changed since the
  // rooms page rendered.
  const available = await countRoomsAvailable(checkIn, checkOut);
  if (available < quantity) {
    return {
      errors: {},
      message:
        available === 0
          ? `Sorry, ${ROOM.label} is fully booked for those dates. Please choose different dates.`
          : `Only ${available} room${available > 1 ? "s" : ""} left for those dates. Please reduce the quantity.`,
    };
  }

  const ref = generateRef();
  const charge = await paymentProvider.charge(priced.total, priced.currency, ref);

  if (!charge.ok) {
    return { errors: {}, message: charge.error };
  }

  const booking = await createBookingRecord({
    ref,
    kind: "room",
    roomQuantity: quantity,
    start: checkIn,
    end: checkOut,
    total: priced.total,
    currency: priced.currency,
    customer,
    transactionId: charge.transactionId,
  });

  await notify(booking);
  redirect(`/booking/${ref}`);
}

// Best-effort: the booking is already charged and saved by the time this
// runs, so a broken notification must never fail the checkout. Awaited (not
// fire-and-forget) because Server Action work left unawaited can be torn
// down once the response starts, especially on serverless deploys.
async function notify(booking: Awaited<ReturnType<typeof createBookingRecord>>) {
  try {
    const notified = await notificationProvider.notifyNewBooking(booking);
    if (!notified.ok) {
      console.error("Booking notification failed:", notified.error);
    }
  } catch (err) {
    console.error("Booking notification threw:", err);
  }
}
