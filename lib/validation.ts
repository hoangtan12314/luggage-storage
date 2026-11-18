import { z } from "zod";
import { classDateBounds } from "./class-dates";
import { CLASS_SEATS_PER_SESSION, getSizeConfig, getWorkshop, ROOM } from "./config";
import type { BookingItem } from "./types";

export const lockerSizeSchema = z.enum(["small", "large"]);

/** Serializes a selection for the URL: `small:2,large:1`. */
export function encodeItems(items: BookingItem[]): string {
  return items.map((i) => `${i.size}:${i.quantity}`).join(",");
}

/**
 * Parses the `items` query parameter. Treated as untrusted input: unknown
 * sizes, non-numeric or out-of-range quantities, duplicates and empty
 * selections are all rejected rather than coerced.
 */
const itemsSchema = z
  .string()
  .min(1)
  .transform((raw, ctx) => {
    const items: BookingItem[] = [];
    const seen = new Set<string>();

    for (const part of raw.split(",")) {
      const [rawSize, rawQty] = part.split(":");
      const size = lockerSizeSchema.safeParse(rawSize);

      if (!size.success) {
        ctx.addIssue({ code: "custom", message: `Unknown locker size: ${rawSize}` });
        return z.NEVER;
      }
      if (seen.has(size.data)) {
        ctx.addIssue({ code: "custom", message: `Duplicate size: ${size.data}` });
        return z.NEVER;
      }
      seen.add(size.data);

      const quantity = Number(rawQty);
      const { inventory } = getSizeConfig(size.data);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > inventory) {
        ctx.addIssue({
          code: "custom",
          message: `Quantity for ${size.data} must be between 1 and ${inventory}`,
        });
        return z.NEVER;
      }

      items.push({ size: size.data, quantity });
    }

    if (items.length === 0) {
      ctx.addIssue({ code: "custom", message: "Select at least one locker" });
      return z.NEVER;
    }

    return items;
  });

export const selectionSchema = z
  .object({
    items: itemsSchema,
    start: z.iso.datetime({ offset: true }),
    end: z.iso.datetime({ offset: true }),
  })
  .refine((val) => Date.parse(val.end) > Date.parse(val.start), {
    message: "End must be after start",
    path: ["end"],
  });

export type SelectionInput = z.infer<typeof selectionSchema>;

/**
 * Parses the room selection query params: checkIn, checkOut ("YYYY-MM-DD"),
 * and quantity (1..ROOM.inventory). Same untrusted-input posture as the
 * luggage schema above — re-run server-side, never trusted from the URL.
 */
export const roomSelectionSchema = z
  .object({
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid check-in date"),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid check-out date"),
    quantity: z.coerce
      .number()
      .int()
      .min(1, "Select at least one room")
      .max(ROOM.inventory, `Only ${ROOM.inventory} rooms available`),
  })
  .refine((val) => val.checkOut > val.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type RoomSelectionInput = z.infer<typeof roomSelectionSchema>;

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
});

export type CustomerInput = z.infer<typeof customerSchema>;

/**
 * Class selection: which workshop, on which date, at which start time, for
 * how many people. Untrusted input like the other selection schemas — the
 * time must be one the chosen workshop actually offers, and the date must
 * fall inside the bookable window in the shop's timezone.
 */
export const classSelectionSchema = z
  .object({
    workshopId: z.string().min(1, "Choose a class"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
    people: z.coerce
      .number()
      .int()
      .min(1, "Choose at least 1 person")
      .max(CLASS_SEATS_PER_SESSION, `At most ${CLASS_SEATS_PER_SESSION} people per booking`),
  })
  .superRefine((val, ctx) => {
    const workshop = getWorkshop(val.workshopId);
    if (!workshop) {
      ctx.addIssue({ code: "custom", message: "Choose a class", path: ["workshopId"] });
      return;
    }
    if (!workshop.availableTimes.includes(val.time)) {
      ctx.addIssue({
        code: "custom",
        message: "Choose one of the available times",
        path: ["time"],
      });
    }
    const { min, max } = classDateBounds();
    if (val.date < min) {
      ctx.addIssue({
        code: "custom",
        message: "Classes can be booked from tomorrow — call us for same-day",
        path: ["date"],
      });
    } else if (val.date > max) {
      ctx.addIssue({
        code: "custom",
        message: "That date is too far ahead — choose a nearer date",
        path: ["date"],
      });
    }
  });

export type ClassSelectionInput = z.infer<typeof classSelectionSchema>;

// Digits plus the punctuation people actually type in phone numbers.
const phoneField = z
  .string()
  .trim()
  .min(7, "Enter a valid number")
  .max(20, "Enter a valid number")
  .regex(/^\+?[\d\s().-]+$/, "Enter a valid number");

// An empty or missing input means "not provided", not "invalid".
const optionalPhone = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  phoneField.optional()
);

/**
 * Class guests may leave either phone or WhatsApp blank, but not both — the
 * owner needs some way to reach them. The group error lives on the
 * `contact` path so the form can show it once beside both fields.
 */
export const classCustomerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: z.email("Enter a valid email address"),
    phone: optionalPhone,
    whatsapp: optionalPhone,
  })
  .refine((val) => val.phone || val.whatsapp, {
    message: "Enter a phone number or a WhatsApp number",
    path: ["contact"],
  });

export type ClassCustomerInput = z.infer<typeof classCustomerSchema>;

/** Optional free text from the guest (allergies, dietary needs). */
export const classNotesSchema = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().max(500, "Please keep notes under 500 characters").optional()
);
