import { Resend } from "resend";
import { buildBookingEmail, buildCustomerConfirmationEmail } from "./template";
import type { NotificationProvider, NotifyResult } from "./provider";

/**
 * Without EMAIL_FROM, owner emails go from Resend's shared test domain
 * (onboarding@resend.dev), which can only deliver to the Resend account owner.
 *
 * Emailing anyone else (family owners, guests) needs a *verified domain* in
 * Resend: verify ngosaigon.com there and set EMAIL_FROM, e.g.
 *   EMAIL_FROM="Ngõ Saigon <bookings@ngosaigon.com>"
 * Until then those sends are rejected by Resend and the confirm page shows why.
 * Replies to a customer email go to the first NOTIFY_EMAIL address, which may list
 * several owners separated by commas (they can only receive once the domain is verified).
 */
export const resendNotificationProvider: NotificationProvider = {
  async notifyNewBooking(booking, confirmUrl): Promise<NotifyResult> {
    // One or more owner addresses, comma-separated: NOTIFY_EMAIL="a@x.com, b@y.com".
    const notifyEmails = (process.env.NOTIFY_EMAIL ?? "")
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean);
    if (notifyEmails.length === 0) {
      return { ok: false, error: "NOTIFY_EMAIL is not set" };
    }

    // Constructed lazily (not at module scope): this file is imported
    // unconditionally by index.ts even when the console fallback is the
    // active provider, and the Resend constructor throws on a missing key.
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { subject, html, text } = buildBookingEmail(booking, confirmUrl);
    const { error } = await resend.emails.send({
      // With a verified domain (EMAIL_FROM) the owner mail can reach every NOTIFY_EMAIL
      // address; the shared test sender only reaches the Resend account owner.
      from: process.env.EMAIL_FROM || "Ngo Saigon Bookings <onboarding@resend.dev>",
      to: notifyEmails,
      subject,
      html,
      text,
    });

    return error ? { ok: false, error: error.message } : { ok: true };
  },

  async sendCustomerConfirmation(booking): Promise<NotifyResult> {
    const from = process.env.EMAIL_FROM;
    if (!from) {
      return {
        ok: false,
        error:
          "EMAIL_FROM is not set. Verify ngosaigon.com in Resend and set EMAIL_FROM (e.g. Ngõ Saigon <bookings@ngosaigon.com>) to email guests.",
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { subject, html, text } = buildCustomerConfirmationEmail(booking);
    const { error } = await resend.emails.send({
      from,
      to: [booking.customer.email],
      replyTo: (process.env.NOTIFY_EMAIL ?? "").split(",")[0]?.trim() || undefined,
      subject,
      html,
      text,
    });

    return error ? { ok: false, error: error.message } : { ok: true };
  },
};
