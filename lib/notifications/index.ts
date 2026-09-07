import { consoleNotificationProvider } from "./console";
import { resendNotificationProvider } from "./resend";
import type { NotificationProvider } from "./provider";

// Falls back to logging when no API key is configured, so the booking flow
// works out of the box before Resend is set up. See lib/notifications/resend.ts.
export const notificationProvider: NotificationProvider = process.env
  .RESEND_API_KEY
  ? resendNotificationProvider
  : consoleNotificationProvider;

export type { NotificationProvider, NotifyResult } from "./provider";
