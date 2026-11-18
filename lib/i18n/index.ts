import { en } from "./en";
import { classesCopy } from "./classes";
import { landingCopy } from "./landing";
import { roomsCopy } from "./rooms";
import { vi } from "./vi";
import type { HomeCopy, Locale } from "./types";

/** Luggage-page copy (the original single-page copy, unchanged). */
export const copy: Record<Locale, HomeCopy> = { en, vi };
export { classesCopy, landingCopy, roomsCopy };
export type {
  HomeCopy,
  Locale,
  Landmark,
  FaqItem,
  ClassesCopy,
  LandingCopy,
  ServiceCardCopy,
  RoomsCopy,
} from "./types";
