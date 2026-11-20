import type { Booking } from "../types";

export type NotifyResult = { ok: true } | { ok: false; error: string };

export interface NotificationProvider {
  /** Tells the owner about a new request; `confirmUrl` is the signed link that confirms it. */
  notifyNewBooking(booking: Booking, confirmUrl?: string | null): Promise<NotifyResult>;
  /** Emails the guest that the owner has confirmed their request. */
  sendCustomerConfirmation(booking: Booking): Promise<NotifyResult>;
}
