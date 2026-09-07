import { Resend } from "resend";
import { buildBookingEmail } from "./template";
import type { NotificationProvider, NotifyResult } from "./provider";

/**
 * Sends via Resend's shared test domain (onboarding@resend.dev). That sender
 * can only deliver to the email address that owns the Resend account — which
 * is exactly NOTIFY_EMAIL here, so no custom domain verification is needed.
 * Switch the `from` to a verified domain address if this ever needs to email
 * anyone other than the account owner (e.g. customer confirmations).
 */
export const resendNotificationProvider: NotificationProvider = {
  async notifyNewBooking(booking): Promise<NotifyResult> {
    const notifyEmail = process.env.NOTIFY_EMAIL;
    if (!notifyEmail) {
      return { ok: false, error: "NOTIFY_EMAIL is not set" };
    }

    // Constructed lazily (not at module scope): this file is imported
    // unconditionally by index.ts even when the console fallback is the
    // active provider, and the Resend constructor throws on a missing key.
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { subject, html, text } = buildBookingEmail(booking);
    const { error } = await resend.emails.send({
      from: "Ngo Saigon Bookings <onboarding@resend.dev>",
      to: [notifyEmail],
      subject,
      html,
      text,
    });

    return error ? { ok: false, error: error.message } : { ok: true };
  },
};
