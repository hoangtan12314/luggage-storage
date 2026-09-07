import { buildBookingEmail } from "./template";
import type { NotificationProvider, NotifyResult } from "./provider";

/**
 * Default provider when RESEND_API_KEY isn't set. Logs what would have been
 * sent instead of sending it, so `pnpm dev`/`pnpm build` work with zero setup
 * and the booking flow is fully testable before signing up for Resend.
 */
export const consoleNotificationProvider: NotificationProvider = {
  async notifyNewBooking(booking): Promise<NotifyResult> {
    const { subject, text } = buildBookingEmail(booking);
    console.log(
      `[notifications] RESEND_API_KEY not set — logging instead of sending.\nSubject: ${subject}\n${text}`
    );
    return { ok: true };
  },
};
