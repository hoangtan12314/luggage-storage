export type LockerSize = "small" | "large";

export type DurationUnit = "hour" | "day" | "week";

export type BookingKind = "luggage" | "room";

/** One line of a customer's selection: N lockers of a given size. */
export type BookingItem = {
  size: LockerSize;
  quantity: number;
};

/** Raw luggage selection as carried in the URL between the luggage page and checkout. */
export type BookingSelection = {
  items: BookingItem[];
  start: string; // ISO 8601
  end: string; // ISO 8601
};

/** Raw room selection as carried in the URL between the rooms page and checkout. */
export type RoomSelection = {
  checkIn: string; // "YYYY-MM-DD"
  checkOut: string; // "YYYY-MM-DD"
  quantity: number;
};

/** One billing block applied to a single locker, e.g. "2 × day @ 50,000". */
export type QuoteLine = {
  unit: DurationUnit;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

/** Pricing for all lockers of one size within a quote. */
export type QuotedItem = {
  size: LockerSize;
  quantity: number;
  /** Billing blocks for a single locker of this size. */
  lines: QuoteLine[];
  /** Price of one locker for the whole period. */
  unitTotal: number;
  /** unitTotal × quantity. */
  subtotal: number;
};

export type Quote = {
  kind: "luggage";
  items: QuotedItem[];
  start: string; // ISO 8601
  end: string; // ISO 8601
  total: number;
  currency: "VND";
};

/** Room pricing: nights × nightly rate × quantity — no block-billing, unlike luggage. */
export type RoomQuote = {
  kind: "room";
  checkIn: string; // "YYYY-MM-DD"
  checkOut: string; // "YYYY-MM-DD"
  nights: number;
  quantity: number;
  nightlyRate: number;
  total: number;
  currency: "VND";
};

export type AnyQuote = Quote | RoomQuote;

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
};

/**
 * A booking is either a luggage stay or a room stay, tagged by `kind`.
 * Modeled as one type with optional kind-specific fields (rather than a
 * strict discriminated union) so the shared plumbing — the repository,
 * notifications, the confirmation page — stays a single code path with a
 * `kind` branch at the few points that actually differ, instead of forcing
 * type-narrowing through every existing call site. Narrow on `kind` before
 * reading `items` or `roomQuantity`.
 */
export type Booking = {
  ref: string;
  kind: BookingKind;
  /** Luggage only. */
  items?: BookingItem[];
  /** Room only. */
  roomQuantity?: number;
  start: string; // ISO 8601 (luggage) or "YYYY-MM-DD" (room, checkIn)
  end: string; // ISO 8601 (luggage) or "YYYY-MM-DD" (room, checkOut)
  total: number;
  currency: "VND";
  customer: CustomerDetails;
  transactionId: string;
  createdAt: string; // ISO 8601
};
