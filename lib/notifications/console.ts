import { buildBookingEmail, buildCustomerConfirmationEmail } from "./template";
import type { NotificationProvider, NotifyResult } from "./provider";

/**
 * Default provider when RESEND_API_KEY isn't set. Logs what would have been
 * sent instead of sending it, so `pnpm dev`/`pnpm build` work with zero setup
 * and the booking flow is fully testable before signing up for Resend.
 */
export const consoleNotificationProvider: NotificationProvider = {
  async notifyNewBooking(booking, confirmUrl): Promise<NotifyResult> {
    const { subject, text } = buildBookingEmail(booking, confirmUrl);
    console.log(
      `[notifications] RESEND_API_KEY not set — logging instead of sending.\nSubject: ${subject}\n${text}`
    );
    return { ok: true };
  },

  async sendCustomerConfirmation(booking): Promise<NotifyResult> {
    const { subject, text } = buildCustomerConfirmationEmail(booking);
    console.log(
      `[notifications] RESEND_API_KEY not set — would email ${booking.customer.email}.\nSubject: ${subject}\n${text}`
    );
    return { ok: true };
  },
};
