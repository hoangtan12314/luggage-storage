import type { Locale } from "./i18n/types";
import type { LockerSize } from "./types";

// The single source of truth for the site's canonical URL. Everything that
// needs an absolute URL (metadata, sitemap, robots.txt, JSON-LD) reads this,
// so there is exactly one place to update once a real domain exists.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

/**
 * Vietnamese pages are temporarily switched off. While this is false the
 * language switcher is hidden everywhere (header, mobile menu, footer), /vi
 * and /vi/* redirect to their English counterparts (next.config.ts), and /vi
 * is left out of the sitemap and hreflang alternates. The Vietnamese pages and
 * copy are all still in the repo — set this to true to bring them back.
 */
export const VIETNAMESE_ENABLED = false;

export type LocalizedText = Record<Locale, string>;

// Full addresses (no abbreviations), in the language of the page. TODO: the
// owner's data names Campus 2's ward as "Ben Thanh" and Campus 1's as "Pham Ngu
// Lao" — confirm both ward names.
const CAMPUS_1_ADDRESS: LocalizedText = {
  en: "104/23 Bui Vien, Pham Ngu Lao Ward, District 1, Ho Chi Minh City, Vietnam",
  vi: "104/23 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
};

const CAMPUS_2_ADDRESS: LocalizedText = {
  en: "199/14 De Tham, Ben Thanh Ward, District 1, Ho Chi Minh City, Vietnam",
  vi: "199/14 Đề Thám, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
};

export const LOCATION = {
  name: "Ngõ Saigon Homestay",
  shortName: "Ngõ Saigon",
  // English; Campus 2 (the homestay). Per-language text: CAMPUS_2.address.
  address: CAMPUS_2_ADDRESS.en,
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

export type CampusId = "campus-1" | "campus-2";

export type Campus = {
  id: CampusId;
  name: string;
  /** Full address in each language. */
  address: LocalizedText;
};

/**
 * The shop's two locations. Campus 1 is where the cooking classes meet;
 * Campus 2 is the existing homestay (rooms and luggage storage, i.e.
 * LOCATION). Both share LOCATION's phone and opening hours — TODO: add
 * per-campus phone/hours/coordinates here if they ever differ.
 */
export const CAMPUS_1: Campus = {
  id: "campus-1",
  name: "Campus 1",
  address: CAMPUS_1_ADDRESS,
};

export const CAMPUS_2: Campus = {
  id: "campus-2",
  name: "Campus 2",
  address: CAMPUS_2_ADDRESS,
};

export const CAMPUSES: Campus[] = [CAMPUS_1, CAMPUS_2];

/** The year the shop opened — shown as "Since 2021" and in the © range. */
export const ESTABLISHED_YEAR = 2021;

export type SocialId = "facebook" | "instagram" | "getyourguide" | "klook";

/**
 * Where else the shop can be found. A link with an empty `url` is simply not
 * shown, so nothing in the footer ever points at a placeholder.
 *
 * TODO: add the Facebook, Instagram and Klook URLs. The GetYourGuide link is
 * the owner's spring-roll listing (tracking parameters removed); swap it for
 * the provider page if there is one.
 */
export const SOCIAL_LINKS: { id: SocialId; label: string; url: string }[] = [
  { id: "facebook", label: "Facebook", url: "" },
  { id: "instagram", label: "Instagram", url: "" },
  {
    id: "getyourguide",
    label: "GetYourGuide",
    url: "https://www.getyourguide.com/ho-chi-minh-city-l272/ho-chi-minh-city-vietnamese-spring-roll-cooking-class-t1092649/",
  },
  { id: "klook", label: "Klook", url: "" },
];

/**
 * Where a class meets: always one of the campuses, so the address follows the
 * page's language like everywhere else.
 */
export function getMeetingAddress(meetingPoint: { campus: CampusId }, locale: Locale): string {
  return getCampus(meetingPoint.campus)?.address[locale] ?? "";
}

export function getCampus(id: CampusId | undefined): Campus | undefined {
  return CAMPUSES.find((c) => c.id === id);
}

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

export type RoomConfig = {
  label: string;
  description: string;
  capacity: string;
  nightly: number;
  inventory: number;
  /** Standard check-in/out times, "HH:mm" in LOCATION.timezone. */
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
};

/**
 * Sample data — the room-booking UI is built ahead of the pricing backend
 * (see the plan). Nothing here is a confirmed real number yet.
 *
 * TODO: confirm the real nightly rate, capacity, amenities and check-in/out
 * times with the shop before this goes live. `nightly` in particular is a
 * placeholder guess, not a quoted price.
 */
export const ROOM: RoomConfig = {
  label: "Private Room",
  description:
    "A private ensuite room a few steps from the luggage counter — quiet, air-conditioned, and walking distance from Ben Thanh Market and Bui Vien.",
  capacity: "Up to 2 guests",
  nightly: 450_000,
  inventory: 3,
  checkInTime: "14:00",
  checkOutTime: "12:00",
  amenities: [
    "Air conditioning",
    "Ensuite bathroom",
    "Free WiFi",
    "Daily housekeeping",
  ],
};

export function getSizeConfig(id: LockerSize): SizeConfig {
  const size = SIZES.find((s) => s.id === id);
  if (!size) {
    throw new Error(`Unknown locker size: ${id}`);
  }
  return size;
}

export type Workshop = {
  id: string;
  /** Proper-noun product name — shown as-is in both languages. */
  name: string;
  pricePerPerson: number;
  /** Start times, "HH:mm" in LOCATION.timezone. */
  availableTimes: string[];
  /** How long the class lasts, in hours (e.g. 1, 2.5, 3). */
  durationHours: number;
  /**
   * Cover photo under /public. Omit until the shop has a photo that
   * actually shows this class — the page falls back to an icon panel rather
   * than reusing a photo of a different class.
   */
  image?: string;
  /**
   * Which class *type* this workshop belongs to ("coffee", "cocoa",
   * "spring-roll"). Workshops with the same value are the options of one
   * class page.
   */
  icon: "coffee" | "cocoa" | "spring-roll";

  /** English copy; Vietnamese translations live in lib/i18n/class-content.ts. */
  highlights: string[];
  description: string;
  includes: string[];
  excludes?: string[];
  notSuitableFor?: string[];

  meetingPoint: {
    /** Which campus the class meets at: its name and address come from CAMPUSES. */
    campus: CampusId;
    details?: string;
  };
};

/**
 * Most guests in a single class booking. There is no limit on how many
 * bookings a start time takes — the owner confirms each request by hand.
 */
export const MAX_PEOPLE_PER_BOOKING = 5;

/**
 * Facts shown on every class page. TODO: free cancellation and the languages
 * the instructor speaks (wording in lib/i18n/classes.ts) come from the owner's
 * GetYourGuide listing and apply to every class. Free cancellation is a
 * policy statement only: there is no cancel feature, guests call or message
 * the shop. Durations are per workshop (`Workshop.durationHours`).
 */
export const CLASS_FACTS = {
  freeCancellationHours: 24,
} as const;

const COFFEE_HIGHLIGHTS = [
  "Create Vietnamese Bánh Mì and 4 traditional coffee drinks with local guides",
  "Discover the stories behind Vietnamese cuisine and its French influence",
  "Experience hands-on preparation using traditional ingredients & local recipes",
  "Explore the flavors & cultural significance of Vietnamese coffee and street food",
  "Receive all recipes as a special gift to recreate the experience at home",
];

const COFFEE_INCLUDES = [
  "Local guide & barista guidance",
  "All ingredients and equipment for coffee & Bánh Mì making",
  "Hands-on experience making Vietnamese Bánh Mì and 4 traditional coffee drinks",
  "Tasting of all coffee creations and your handmade Bánh Mì",
  "Small-group experience with cultural stories and Q&A session",
  "All recipes shared as a special gift after the class",
  "Vegan options available upon request",
];

const COCOA_HIGHLIGHTS = [
  "Create Vietnamese Bánh Mì and 4 traditional cocoa drinks with local guides",
  "Discover the stories behind & the French influence on Vietnamese cuisine",
  "Explore the flavors & cultural significance of Vietnamese Cocoa and street food",
  "Receive all recipes as a special gift to recreate the experience at home",
];

// The last line was cut off in the text the owner supplied ("…available upo");
// completed to match the coffee list. TODO: owner to confirm.
const COCOA_INCLUDES = [
  "Local guide & barista guidance",
  "All ingredients and equipment for cocoa and Bánh Mì making",
  "Hands-on experience making Vietnamese Bánh Mì and 4 traditional Cocoa drinks",
  "Tasting of all cocoa creations and your handmade Bánh Mì",
  "Small-group experience with cultural stories and Q&A session",
  "All recipes shared as a special gift after the class",
  "Vegan options available upon request",
];

const SPRING_ROLL_HIGHLIGHTS = [
  "Roll your own fresh Vietnamese spring rolls in a hands-on class",
  "Master 3 legendary Vietnamese dipping sauces with expert guidance",
  "Enjoy a small, intimate class with hands-on guidance for each participant",
  "Discover a tiny Saigon corner with Hanoi’s cozy alley vibes",
];

const SPRING_ROLL_INCLUDES = [
  "Welcome drink: Vietnamese-style mojito",
  "Hands-on guidance to make Vietnamese spring rolls",
  "All fresh ingredients: herbs, veggies, noodles, pre-cooked proteins",
  "Instruction to master three legendary dipping sauces",
  "Use of cooking tools and utensils provided",
  "Small group personalized attention",
  "Takeaway box if you can’t finish your rolls",
];

const COFFEE_DESCRIPTION =
  "Learn to make authentic Vietnamese coffee and bánh mì in a hands-on workshop guided by local experts. Discover the history and cultural significance behind two of Vietnam’s most iconic foods while creating and enjoying your own delicious creations.";

const COCOA_DESCRIPTION =
  "Learn to make authentic Vietnamese cocoa drinks and Bánh Mì in a hands-on workshop guided by local experts. Discover the history and cultural significance behind Vietnamese cacao and one of the country's most iconic foods while creating and enjoying your own delicious creations.";

const SPRING_ROLL_DESCRIPTION =
  "Step into Ngõ Saigon, a cozy corner in Saigon inspired by the charm of Hanoi’s hidden alleys, for a hands-on no-fire dinner experience. Start by exploring fresh herbs, crisp vegetables, tender rice noodles, and pre-prepared proteins carefully selected to create the perfect Vietnamese spring rolls. Under the guidance of your instructor, learn to prepare fresh spring rolls and master three legendary dipping sauces.";

// All classes meet at Campus 1 (Bùi Viện) — NOT the homestay in LOCATION. The
// owner's text formatted this address two ways; it is now one constant.
const CLASS_MEETING_POINT = {
  campus: CAMPUS_1.id,
};

/** The shop's cooking workshops, exactly as the owner supplied them. */
export const WORKSHOPS: Workshop[] = [
  {
    id: "coffee-banh-mi",
    name: "Coffee & Bánh Mì Workshop",
    pricePerPerson: 219_000,
    availableTimes: ["09:00", "11:00", "13:00", "15:00"],
    durationHours: 1,
    image: "/cooking-class-service.jpg",
    icon: "coffee",

    highlights: COFFEE_HIGHLIGHTS,
    description: COFFEE_DESCRIPTION,
    includes: COFFEE_INCLUDES,
    excludes: ["Transportation to the workshop"],
    notSuitableFor: ["Children under 6 years", "People over 95 years"],
    meetingPoint: CLASS_MEETING_POINT,
  },
  {
    id: "four-types-coffee",
    name: "4 Types Coffee & Bánh Mì",
    pricePerPerson: 449_000,
    availableTimes: ["09:00", "11:00", "13:00", "15:00"],
    durationHours: 3,
    image: "/cooking-class-service.jpg",
    icon: "coffee",

    highlights: COFFEE_HIGHLIGHTS,
    description: COFFEE_DESCRIPTION,
    includes: COFFEE_INCLUDES,
    excludes: ["Transportation to the workshop"],
    notSuitableFor: ["Children under 6 years", "People over 95 years"],
    meetingPoint: CLASS_MEETING_POINT,
  },
  {
    id: "cocoa-banh-mi",
    name: "Cocoa & Bánh Mì Workshop",
    pricePerPerson: 219_000,
    availableTimes: ["09:00", "11:00", "13:00", "15:00"],
    durationHours: 1,
    icon: "cocoa",

    highlights: COCOA_HIGHLIGHTS,
    description: COCOA_DESCRIPTION,
    includes: COCOA_INCLUDES,
    excludes: ["Transportation to the workshop"],
    notSuitableFor: ["Children under 6 years", "People over 95 years"],
    meetingPoint: CLASS_MEETING_POINT,
  },
  {
    id: "four-types-cocoa",
    name: "4 Types Cocoa & Bánh Mì",
    pricePerPerson: 449_000,
    availableTimes: ["09:00", "11:00", "13:00", "15:00"],
    durationHours: 3,
    icon: "cocoa",

    highlights: COCOA_HIGHLIGHTS,
    description: COCOA_DESCRIPTION,
    includes: COCOA_INCLUDES,
    excludes: ["Transportation to the workshop"],
    notSuitableFor: ["Children under 6 years", "People over 95 years"],
    meetingPoint: CLASS_MEETING_POINT,
  },
  {
    id: "spring-roll-fresh",
    name: "Fresh Spring Roll",
    pricePerPerson: 499_000,
    availableTimes: ["17:00"],
    durationHours: 1.5,
    icon: "spring-roll",
    highlights: SPRING_ROLL_HIGHLIGHTS,
    description: SPRING_ROLL_DESCRIPTION,
    includes: SPRING_ROLL_INCLUDES,
    meetingPoint: CLASS_MEETING_POINT,
  },
  {
    id: "spring-roll",
    name: "Fresh & Fried Spring Roll",
    pricePerPerson: 899_000,
    availableTimes: ["17:00"],
    durationHours: 2.5,
    icon: "spring-roll",
    highlights: SPRING_ROLL_HIGHLIGHTS,
    description: SPRING_ROLL_DESCRIPTION,
    includes: SPRING_ROLL_INCLUDES,
    meetingPoint: CLASS_MEETING_POINT,
  },
];

export function getWorkshop(id: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.id === id);
}

export type ClassTypeSlug = Workshop["icon"];

/**
 * One class page: the workshops that share a type, shown as its options.
 * Content (highlights, description, includes, …) is shared by a type's
 * options, so it is read from the first one.
 */
export type ClassType = {
  slug: ClassTypeSlug;
  /** Page title — the first option's name, e.g. "Coffee & Bánh Mì Workshop". */
  title: string;
  options: Workshop[];
  fromPrice: number;
  /** Detail-page photo (the album, later). */
  image?: string;
  /** Portrait poster shown on the class card in the /classes list. */
  poster?: string;
  content: Workshop;
};

/** Card posters for the /classes list, one per class type (portrait, 3:4). */
const CLASS_POSTERS: Record<ClassTypeSlug, string> = {
  coffee: "/coffee-class-poster.jpg",
  cocoa: "/cocoa-class-poster.jpg",
  "spring-roll": "/springroll-class-poster.jpg",
};

/** Derived from WORKSHOPS (never maintained by hand), in first-seen order. */
export const CLASS_TYPES: ClassType[] = WORKSHOPS.reduce<ClassType[]>((types, w) => {
  const existing = types.find((t) => t.slug === w.icon);
  if (existing) {
    existing.options.push(w);
    existing.fromPrice = Math.min(existing.fromPrice, w.pricePerPerson);
    existing.image ??= w.image;
    return types;
  }
  types.push({
    slug: w.icon,
    title: w.name,
    options: [w],
    fromPrice: w.pricePerPerson,
    image: w.image,
    poster: CLASS_POSTERS[w.icon],
    content: w,
  });
  return types;
}, []);

export function getClassType(slug: string): ClassType | undefined {
  return CLASS_TYPES.find((t) => t.slug === slug);
}

/** The class type a workshop belongs to. */
export function getClassTypeOf(workshopId: string): ClassType | undefined {
  const workshop = getWorkshop(workshopId);
  return workshop ? getClassType(workshop.icon) : undefined;
}
