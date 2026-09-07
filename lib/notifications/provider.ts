import type { Booking } from "../types";

export type NotifyResult = { ok: true } | { ok: false; error: string };

export interface NotificationProvider {
  notifyNewBooking(booking: Booking): Promise<NotifyResult>;
}
