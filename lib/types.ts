export type LockerSize = "small" | "large";

export type DurationUnit = "hour" | "day" | "week";

/** One line of a customer's selection: N lockers of a given size. */
export type BookingItem = {
  size: LockerSize;
  quantity: number;
};

/** Raw selection as carried in the URL between the home page and checkout. */
export type BookingSelection = {
  items: BookingItem[];
  start: string; // ISO 8601
  end: string; // ISO 8601
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
  items: QuotedItem[];
  start: string; // ISO 8601
  end: string; // ISO 8601
  total: number;
  currency: "VND";
};

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
};

export type Booking = {
  ref: string;
  items: BookingItem[];
  start: string; // ISO 8601
  end: string; // ISO 8601
  total: number;
  currency: "VND";
  customer: CustomerDetails;
  transactionId: string;
  createdAt: string; // ISO 8601
};
