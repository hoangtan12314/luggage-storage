import { getSizeConfig, LOCATION, ROOM } from "../config";
import { formatVnd } from "../money";
import { describeDuration, quote, quoteRoom } from "../pricing";
import type { Booking } from "../types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: LOCATION.timezone,
  });
}

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

type LineItem = { label: string; breakdown: string; subtotal: string };

/**
 * Builds the owner-notification email for a confirmed booking (luggage or
 * room). Reuses quote()/quoteRoom() for the breakdown rather than
 * re-deriving it by hand, so this can never disagree with what the customer
 * saw on checkout/confirmation.
 */
export function buildBookingEmail(booking: Booking) {
  const isRoom = booking.kind === "room";

  const stayLine = isRoom
    ? `Check-in: ${formatDate(booking.start)}\nCheck-out: ${formatDate(booking.end)}`
    : `Drop off: ${formatDateTime(booking.start)}\nPick up: ${formatDateTime(booking.end)}`;

  const stayRows = isRoom
    ? [
        ["Check-in", formatDate(booking.start)],
        ["Check-out", formatDate(booking.end)],
      ]
    : [
        ["Drop off", formatDateTime(booking.start)],
        ["Pick up", formatDateTime(booking.end)],
        ["Duration", describeDuration(booking.start, booking.end)],
      ];

  let itemLines: LineItem[];
  if (isRoom) {
    const priced = quoteRoom(booking.start, booking.end, booking.roomQuantity ?? 1);
    itemLines = [
      {
        label: `${ROOM.label} × ${priced.quantity}`,
        breakdown: `${priced.nights} night${priced.nights > 1 ? "s" : ""}: ${formatVnd(priced.nightlyRate)}`,
        subtotal: formatVnd(priced.total),
      },
    ];
  } else {
    const priced = quote(booking.items ?? [], booking.start, booking.end);
    itemLines = priced.items.map((item) => {
      const breakdown = item.lines
        .map(
          (l) =>
            `${l.quantity} ${l.unit}${l.quantity > 1 ? "s" : ""}: ${formatVnd(l.unitPrice)}`
        )
        .join(" + ");
      return {
        label: `${getSizeConfig(item.size).label} × ${item.quantity}`,
        breakdown,
        subtotal: formatVnd(item.subtotal),
      };
    });
  }

  const subject = `New ${isRoom ? "room" : "luggage"} booking ${booking.ref} — ${formatVnd(booking.total)}`;

  const text = [
    `New ${isRoom ? "room" : "luggage"} booking: ${booking.ref}`,
    "",
    `Customer: ${booking.customer.name}`,
    `Email: ${booking.customer.email}`,
    `Phone: ${booking.customer.phone}`,
    "",
    stayLine,
    "",
    ...itemLines.map((i) => `${i.label} — ${i.subtotal} (${i.breakdown})`),
    "",
    `Total: ${formatVnd(booking.total)}`,
    "",
    `${LOCATION.name}, ${LOCATION.address}`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">New ${isRoom ? "room" : "luggage"} booking: ${booking.ref}</h2>
      <p style="color: #666; margin-top: 0;">${LOCATION.name}</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="color: #666; padding: 4px 0;">Customer</td><td style="text-align: right;">${booking.customer.name}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Email</td><td style="text-align: right;">${booking.customer.email}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Phone</td><td style="text-align: right;">${booking.customer.phone}</td></tr>
        ${stayRows
          .map(
            ([label, value]) =>
              `<tr><td style="color: #666; padding: 4px 0;">${label}</td><td style="text-align: right;">${value}</td></tr>`
          )
          .join("")}
      </table>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 12px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${itemLines
          .map(
            (i) => `
        <tr>
          <td style="padding: 4px 0;">
            ${i.label}
            <div style="color: #666; font-size: 12px;">${i.breakdown}</div>
          </td>
          <td style="text-align: right; vertical-align: top; padding: 4px 0;">${i.subtotal}</td>
        </tr>`
          )
          .join("")}
      </table>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 12px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 16px; font-weight: 600;">
        <tr><td>Total</td><td style="text-align: right; color: #f9a61c;">${formatVnd(booking.total)}</td></tr>
      </table>

      <p style="color: #999; font-size: 12px; margin-top: 24px;">${LOCATION.address}</p>
    </div>
  `;

  return { subject, text, html };
}
