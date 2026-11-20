import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Booking } from "./types";

/**
 * Stateless, tamper-proof booking tokens: the booking itself is the payload,
 * signed with HMAC-SHA256. They let the owner's "confirm" link and the guest's
 * "request received" page work without a database — the in-memory store is not
 * shared between serverless instances, so a lookup by reference could miss.
 *
 *   token = base64url(JSON booking) + "." + base64url(HMAC(payload))
 *
 * The secret is BOOKING_CONFIRM_SECRET. In production a missing secret disables
 * tokens (sign returns null) rather than falling back to a guessable one; in
 * development a fixed fallback keeps the flow testable with zero setup.
 */

function secret(): string | null {
  const configured = process.env.BOOKING_CONFIRM_SECRET;
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : "dev-only-booking-secret";
}

const b64 = (value: string | Buffer) => Buffer.from(value).toString("base64url");

function signature(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function signBookingToken(booking: Booking): string | null {
  const key = secret();
  if (!key) return null;
  const payload = b64(JSON.stringify(booking));
  return `${payload}.${signature(payload, key)}`;
}

export function verifyBookingToken(token: string): Booking | null {
  const key = secret();
  if (!key) return null;

  const [payload, sig, ...rest] = token.split(".");
  if (!payload || !sig || rest.length > 0) return null;

  const expected = Buffer.from(signature(payload, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const booking = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Booking;
    return booking && typeof booking.ref === "string" ? booking : null;
  } catch {
    return null;
  }
}
