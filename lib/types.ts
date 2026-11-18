export type LockerSize = "small" | "large";

export type DurationUnit = "hour" | "day" | "week";

export type BookingKind = "luggage" | "room" | "class";

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

/** Class pricing: price per person × people — flat, no block-billing. */
export type ClassQuote = {
  kind: "class";
  workshopId: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  people: number;
  pricePerPerson: number;
  total: number;
  currency: "VND";
};

export type AnyQuote = Quote | RoomQuote | ClassQuote;

export type CustomerDetails = {
  name: string;
  email: string;
  /**
   * Required for luggage and room bookings. For classes the guest may give
   * a WhatsApp number instead (at least one of the two) — see
   * classCustomerSchema.
   */
  phone?: string;
  whatsapp?: string;
};

/**
 * A booking is a luggage stay, a room stay or a cooking class, tagged by `kind`.
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
  /** Class only: which workshop, how many people, and the start time ("HH:mm"). */
  workshopId?: string;
  people?: number;
  classTime?: string;
  /**
   * Class only: price per person at the time of booking, stored so the
   * confirmation page never re-quotes from a price that was edited later.
   */
  unitPrice?: number;
  /** Class only: optional allergy / dietary notes from the guest. */
  notes?: string;
  start: string; // ISO 8601 (luggage), "YYYY-MM-DD" (room checkIn, or the class date)
  end: string; // ISO 8601 (luggage), "YYYY-MM-DD" (room checkOut, or the class date)
  total: number;
  currency: "VND";
  customer: CustomerDetails;
  transactionId: string;
  createdAt: string; // ISO 8601
};
