import { en } from "./en";
import { vi } from "./vi";
import type { HomeCopy, Locale } from "./types";

export const copy: Record<Locale, HomeCopy> = { en, vi };
export type { HomeCopy, Locale, Landmark, FaqItem } from "./types";
