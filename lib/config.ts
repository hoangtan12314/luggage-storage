import type { LockerSize } from "./types";

// The single source of truth for the site's canonical URL. Everything that
// needs an absolute URL (metadata, sitemap, robots.txt, JSON-LD) reads this,
// so there is exactly one place to update once a real domain exists.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const LOCATION = {
  name: "Ngõ Saigon Homestay",
  shortName: "Ngõ Saigon",
  address: "199/14 De Tham, Ben Thanh, HCM",
  street: "199/14 De Tham",
  district: "District 1",
  city: "Ho Chi Minh City",
  country: "VN",
  timezone: "Asia/Ho_Chi_Minh",
  // TODO: confirm with the shop — not stated on the poster.
  hours: "All day",
  phone: "+84 9333 63 173",
  // TODO: real coordinates from Google Maps — placeholder is central District 1.
  geo: { lat: 10.7716, lng: 106.698 },
};

/**
 * Where the "Find us" map points.
 *
 * TODO: paste the shop's exact coordinates here (Google Maps -> right-click
 * your door -> click the lat/lng to copy). While this is null the map falls
 * back to geocoding LOCATION.address, which for an alley address like
 * "199/14 De Tham" may resolve to the street entrance rather than the door.
 *
 * Setting this should also replace the LOCATION.geo placeholder above, which
 * the SelfStorage JSON-LD publishes.
 */
export const MAP: { coords: { lat: number; lng: number } | null } = {
  coords: null,
};

export type SizeConfig = {
  id: LockerSize;
  label: string;
  description: string;
  /** What typically fits, shown in the card tooltip. */
  fits: string;
  hourly: number;
  daily: number;
  weekly: number;
  inventory: number;
};

/**
 * Rates come straight from the shop's printed price list:
 *
 *   Type   Hours    Days     Weeks
 *   Small  10,000   50,000   299,000
 *   Large  20,000   80,000   499,000
 *
 * Inventory is a placeholder — TODO: confirm real locker counts.
 */
export const SIZES: SizeConfig[] = [
  {
    id: "small",
    label: "Small",
    description: "Backpack or daypack",
    fits: "Backpacks, daypacks, handbags and small carry-ons.",
    hourly: 10_000,
    daily: 50_000,
    weekly: 299_000,
    inventory: 20,
  },
  {
    id: "large",
    label: "Large",
    description: "Full-size suitcase",
    fits: "Full-size suitcases, large duffel bags and oversized items.",
    hourly: 20_000,
    daily: 80_000,
    weekly: 499_000,
    inventory: 10,
  },
];

export function getSizeConfig(id: LockerSize): SizeConfig {
  const size = SIZES.find((s) => s.id === id);
  if (!size) {
    throw new Error(`Unknown locker size: ${id}`);
  }
  return size;
}
