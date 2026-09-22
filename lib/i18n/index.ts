import { en } from "./en";
import { landingCopy } from "./landing";
import { roomsCopy } from "./rooms";
import { vi } from "./vi";
import type { HomeCopy, Locale } from "./types";

/** Luggage-page copy (the original single-page copy, unchanged). */
export const copy: Record<Locale, HomeCopy> = { en, vi };
export { landingCopy, roomsCopy };
export type {
  HomeCopy,
  Locale,
  Landmark,
  FaqItem,
  LandingCopy,
  RoomsCopy,
} from "./types";
