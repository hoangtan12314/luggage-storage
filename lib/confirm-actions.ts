"use server";

import { verifyBookingToken } from "./confirm-token";
import { notificationProvider } from "./notifications";

export type ConfirmState = {
  status: "idle" | "sent" | "error";
  message: string;
};

/**
 * The owner pressed "Confirm" on the confirm page: re-verify the signed token
 * (never trust the form field alone), then email the guest that their request
 * is confirmed. A POST on purpose — opening the emailed link never confirms
 * anything by itself, so mail scanners that pre-fetch links can't trigger it.
 */
export async function confirmBooking(
  _previous: ConfirmState,
  formData: FormData
): Promise<ConfirmState> {
  const token = String(formData.get("token") ?? "");
  const booking = verifyBookingToken(token);
  if (!booking) {
    return { status: "error", message: "This confirm link is not valid." };
  }

  try {
    const result = await notificationProvider.sendCustomerConfirmation(booking);
    if (!result.ok) {
      console.error("Customer confirmation failed:", result.error);
      return { status: "error", message: `The email could not be sent: ${result.error}` };
    }
  } catch (err) {
    console.error("Customer confirmation threw:", err);
    return { status: "error", message: "The email could not be sent. Please try again." };
  }

  return { status: "sent", message: `Confirmation emailed to ${booking.customer.email}.` };
}
