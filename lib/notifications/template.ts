import { getSizeConfig, LOCATION } from "../config";
import { formatVnd } from "../money";
import { describeDuration, quote } from "../pricing";
import type { Booking } from "../types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: LOCATION.timezone,
  });
}

/**
 * Builds the owner-notification email for a confirmed booking. Reuses
 * `quote()` for the itemized breakdown rather than re-deriving it, so this
 * can never disagree with what the customer saw on checkout/confirmation.
 */
export function buildBookingEmail(booking: Booking) {
  const priced = quote(booking.items, booking.start, booking.end);

  const itemLines = priced.items.map((item) => {
    const breakdown = item.lines
      .map(
        (l) =>
          `${l.quantity} ${l.unit}${l.quantity > 1 ? "s" : ""}: ${formatVnd(l.unitPrice)}`
      )
      .join(" + ");
    return {
      label: getSizeConfig(item.size).label,
      quantity: item.quantity,
      breakdown,
      subtotal: formatVnd(item.subtotal),
    };
  });

  const subject = `New booking ${booking.ref} — ${formatVnd(booking.total)}`;

  const text = [
    `New booking: ${booking.ref}`,
    "",
    `Customer: ${booking.customer.name}`,
    `Email: ${booking.customer.email}`,
    `Phone: ${booking.customer.phone}`,
    "",
    `Drop off: ${formatDateTime(booking.start)}`,
    `Pick up: ${formatDateTime(booking.end)}`,
    `Duration: ${describeDuration(booking.start, booking.end)}`,
    "",
    ...itemLines.map(
      (i) => `${i.label} × ${i.quantity} — ${i.subtotal} (${i.breakdown})`
    ),
    "",
    `Total: ${formatVnd(booking.total)}`,
    "",
    `${LOCATION.name}, ${LOCATION.address}`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">New booking: ${booking.ref}</h2>
      <p style="color: #666; margin-top: 0;">${LOCATION.name}</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="color: #666; padding: 4px 0;">Customer</td><td style="text-align: right;">${booking.customer.name}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Email</td><td style="text-align: right;">${booking.customer.email}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Phone</td><td style="text-align: right;">${booking.customer.phone}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Drop off</td><td style="text-align: right;">${formatDateTime(booking.start)}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Pick up</td><td style="text-align: right;">${formatDateTime(booking.end)}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Duration</td><td style="text-align: right;">${describeDuration(booking.start, booking.end)}</td></tr>
      </table>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 12px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${itemLines
          .map(
            (i) => `
        <tr>
          <td style="padding: 4px 0;">
            ${i.label} × ${i.quantity}
            <div style="color: #666; font-size: 12px;">${i.breakdown}</div>
          </td>
          <td style="text-align: right; vertical-align: top; padding: 4px 0;">${i.subtotal}</td>
        </tr>`
          )
          .join("")}
      </table>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 12px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 16px; font-weight: 600;">
        <tr><td>Total</td><td style="text-align: right; color: #ea580c;">${formatVnd(booking.total)}</td></tr>
      </table>

      <p style="color: #999; font-size: 12px; margin-top: 24px;">${LOCATION.address}</p>
    </div>
  `;

  return { subject, text, html };
}
