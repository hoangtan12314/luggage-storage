import { z } from "zod";
import { getSizeConfig } from "./config";
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
