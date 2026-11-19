import {
  getCampus,
  getMeetingAddress,
  getSizeConfig,
  getWorkshop,
  LOCATION,
  ROOM,
} from "../config";
import { formatVnd } from "../money";
import { describeDuration, quote, quoteClass, quoteRoom } from "../pricing";
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

// Customer-supplied text goes into an HTML email the owner opens, so escape it.
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type LineItem = { label: string; breakdown: string; subtotal: string };

/**
 * Builds the owner-notification email for a confirmed booking (luggage,
 * room or class). Reuses quote()/quoteRoom()/quoteClass() for the breakdown
 * rather than re-deriving it by hand, so this can never disagree with what
 * the customer saw on checkout/confirmation.
 */
export function buildBookingEmail(booking: Booking) {
  const isRoom = booking.kind === "room";
  const isClass = booking.kind === "class";
  const kindLabel = isClass ? "class" : isRoom ? "room" : "luggage";

  const classTime = booking.classTime ?? "";
  const stayLine = isClass
    ? `Date: ${formatDate(booking.start)}\nTime: ${classTime}`
    : isRoom
      ? `Check-in: ${formatDate(booking.start)}\nCheck-out: ${formatDate(booking.end)}`
      : `Drop off: ${formatDateTime(booking.start)}\nPick up: ${formatDateTime(booking.end)}`;

  const stayRows = isClass
    ? [
        ["Date", formatDate(booking.start)],
        ["Time", classTime],
      ]
    : isRoom
      ? [
          ["Check-in", formatDate(booking.start)],
          ["Check-out", formatDate(booking.end)],
        ]
      : [
          ["Drop off", formatDateTime(booking.start)],
          ["Pick up", formatDateTime(booking.end)],
          ["Duration", describeDuration(booking.start, booking.end)],
        ];

  // Phone and WhatsApp are both optional for classes (at least one given).
  const contactRows: [string, string][] = [];
  if (booking.customer.phone) contactRows.push(["Phone", booking.customer.phone]);
  if (booking.customer.whatsapp) contactRows.push(["WhatsApp", booking.customer.whatsapp]);

  const notes = booking.notes?.trim();

  // Where the owner should expect the guest: a class meets at its campus
  // (Campus 1), everything else at the homestay.
  const meetingPoint = isClass ? getWorkshop(booking.workshopId ?? "")?.meetingPoint : undefined;
  const campusName = getCampus(meetingPoint?.campus)?.name;
  const placeLine = meetingPoint
    ? `${campusName ? `${campusName}: ` : ""}${getMeetingAddress(meetingPoint, "en")}`
    : `${LOCATION.name}, ${LOCATION.address}`;

  let itemLines: LineItem[];
  if (isClass) {
    const workshop = getWorkshop(booking.workshopId ?? "");
    const priced = quoteClass(
      {
        id: booking.workshopId ?? "",
        name: workshop?.name ?? "Cooking class",
        pricePerPerson: booking.unitPrice ?? workshop?.pricePerPerson ?? 0,
      },
      booking.start,
      classTime,
      booking.people ?? 1
    );
    itemLines = [
      {
        label: `${priced.name} × ${priced.people}`,
        breakdown: `${priced.people} ${priced.people > 1 ? "people" : "person"}: ${formatVnd(priced.pricePerPerson)} each`,
        subtotal: formatVnd(priced.total),
      },
    ];
  } else if (isRoom) {
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

  const subject = `New ${kindLabel} booking ${booking.ref} — ${formatVnd(booking.total)}`;

  const text = [
    `New ${kindLabel} booking: ${booking.ref}`,
    "",
    `Customer: ${booking.customer.name}`,
    `Email: ${booking.customer.email}`,
    ...contactRows.map(([label, value]) => `${label}: ${value}`),
    ...(notes ? [`Notes (allergies / dietary): ${notes}`] : []),
    "",
    stayLine,
    "",
    ...itemLines.map((i) => `${i.label} — ${i.subtotal} (${i.breakdown})`),
    "",
    `Total: ${formatVnd(booking.total)}`,
    "",
    placeLine,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">New ${kindLabel} booking: ${booking.ref}</h2>
      <p style="color: #666; margin-top: 0;">${LOCATION.name}</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="color: #666; padding: 4px 0;">Customer</td><td style="text-align: right;">${esc(booking.customer.name)}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Email</td><td style="text-align: right;">${esc(booking.customer.email)}</td></tr>
        ${contactRows
          .map(
            ([label, value]) =>
              `<tr><td style="color: #666; padding: 4px 0;">${label}</td><td style="text-align: right;">${esc(value)}</td></tr>`
          )
          .join("")}
        ${
          notes
            ? `<tr><td style="color: #666; padding: 4px 0; vertical-align: top;">Notes</td><td style="text-align: right;">${esc(notes)}</td></tr>`
            : ""
        }
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

      <p style="color: #999; font-size: 12px; margin-top: 24px;">${esc(placeLine)}</p>
    </div>
  `;

  return { subject, text, html };
}
