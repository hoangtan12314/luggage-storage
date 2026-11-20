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
 * Builds the owner-notification email for a new booking *request* (luggage,
 * room or class), with a "Confirm" link that emails the guest once the owner
 * has agreed it with them (usually on WhatsApp). Reuses quote()/quoteRoom()/quoteClass() for the breakdown
 * rather than re-deriving it by hand, so this can never disagree with what
 * the customer saw on checkout/confirmation.
 */
/** wa.me link for a guest's number: "+84…" / "0084…" as given, a leading "0" taken as Vietnam. */
function whatsappLink(phone: string): string | null {
  const raw = phone.replace(/[^\d+]/g, "");
  let digits: string;
  if (raw.startsWith("+")) digits = raw.slice(1);
  else if (raw.startsWith("00")) digits = raw.slice(2);
  else if (raw.startsWith("0")) digits = `84${raw.slice(1)}`;
  else digits = raw;
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

export function buildBookingEmail(booking: Booking, confirmUrl?: string | null) {
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

  const subject = `New ${kindLabel} request ${booking.ref} — ${formatVnd(booking.total)}`;

  // The guest's WhatsApp number if they gave one, otherwise their phone.
  const whatsappTarget = booking.customer.whatsapp || booking.customer.phone || "";
  const whatsapp = whatsappTarget ? whatsappLink(whatsappTarget) : null;

  const text = [
    `New ${kindLabel} REQUEST: ${booking.ref} (not confirmed yet)`,
    "",
    ...(whatsapp ? [`Message the guest on WhatsApp: ${whatsapp}`] : []),
    confirmUrl
      ? `Once agreed, confirm here to email the guest: ${confirmUrl}`
      : "(Confirm link unavailable: BOOKING_CONFIRM_SECRET is not set.)",
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
      <h2 style="margin-bottom: 4px;">New ${kindLabel} request: ${booking.ref}</h2>
      <p style="color: #666; margin-top: 0;">${LOCATION.name} · not confirmed yet</p>

      ${
        whatsapp
          ? `<p style="margin: 12px 0;"><a href="${whatsapp}" style="color: #128c7e; font-weight: 600;">1. Message the guest on WhatsApp</a></p>`
          : ""
      }
      ${
        confirmUrl
          ? `<p style="margin: 12px 0;"><a href="${confirmUrl}" style="display: inline-block; background: #f9a61c; color: #2b1a0e; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 999px;">${whatsapp ? "2. " : ""}Confirm &amp; email the guest</a></p><p style="color: #999; font-size: 12px; margin-top: 0;">Press it only after you have agreed the booking with them.</p>`
          : `<p style="color: #b45309; font-size: 13px;">Confirm link unavailable: BOOKING_CONFIRM_SECRET is not set.</p>`
      }

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

/**
 * The email the guest receives when the owner confirms their request. Plain
 * and short — details, where to come, pay on arrival — with the owner as the
 * reply-to so the guest can answer it.
 */
export function buildCustomerConfirmationEmail(booking: Booking) {
  const isClass = booking.kind === "class";
  const isRoom = booking.kind === "room";
  const what = isClass
    ? (getWorkshop(booking.workshopId ?? "")?.name ?? "cooking class")
    : isRoom
      ? "room booking"
      : "luggage storage";

  const when = isClass
    ? `${formatDate(booking.start)} at ${booking.classTime ?? ""}`
    : isRoom
      ? `${formatDate(booking.start)} → ${formatDate(booking.end)}`
      : `${formatDateTime(booking.start)} → ${formatDateTime(booking.end)}`;

  const meetingPoint = isClass ? getWorkshop(booking.workshopId ?? "")?.meetingPoint : undefined;
  const campusName = getCampus(meetingPoint?.campus)?.name;
  const place = meetingPoint
    ? `${campusName ? `${campusName}: ` : ""}${getMeetingAddress(meetingPoint, "en")}`
    : `${LOCATION.name}, ${LOCATION.address}`;

  const who = isClass && booking.people ? ` for ${booking.people} ${booking.people > 1 ? "guests" : "guest"}` : "";
  const name = booking.customer.name.split(" ")[0] || booking.customer.name;
  const subject = `Confirmed: your ${what} at Ngõ Saigon (${booking.ref})`;

  const text = [
    `Hi ${name},`,
    "",
    `Your ${what}${who} is confirmed. We look forward to seeing you soon!`,
    "",
    `When: ${when}`,
    `Where: ${place}`,
    `Total: ${formatVnd(booking.total)} — pay on arrival`,
    `Reference: ${booking.ref}`,
    "",
    `Need to change something? Message or call us on ${LOCATION.phone}, or just reply to this email.`,
    "",
    `${LOCATION.name}`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #2b1a0e;">
      <h2 style="margin-bottom: 4px;">You're confirmed 🎉</h2>
      <p style="margin-top: 0;">Hi ${esc(name)}, your ${esc(what)}${who} is confirmed. We look forward to seeing you soon!</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="color: #666; padding: 4px 0;">When</td><td style="text-align: right;">${esc(when)}</td></tr>
        <tr><td style="color: #666; padding: 4px 0; vertical-align: top;">Where</td><td style="text-align: right;">${esc(place)}</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Total</td><td style="text-align: right;">${formatVnd(booking.total)} — pay on arrival</td></tr>
        <tr><td style="color: #666; padding: 4px 0;">Reference</td><td style="text-align: right; font-family: monospace;">${booking.ref}</td></tr>
      </table>
      <p style="font-size: 13px; color: #666; margin-top: 20px;">Need to change something? Message or call us on ${esc(LOCATION.phone)}, or just reply to this email.</p>
      <p style="font-size: 13px; color: #666;">${esc(LOCATION.name)}</p>
    </div>
  `;

  return { subject, text, html };
}
