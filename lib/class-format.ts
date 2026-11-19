import type { ClassesCopy, Locale } from "./i18n";

const numberLocale = (locale: Locale) => (locale === "vi" ? "vi-VN" : "en-US");

/** "1 hour", "2.5 hours", "3 hours" (Vietnamese: "2,5 giờ"). */
export function formatHours(
  hours: number,
  copy: Pick<ClassesCopy["detail"], "hourOne" | "hourMany">,
  locale: Locale
): string {
  const template = hours === 1 ? copy.hourOne : copy.hourMany;
  return template.replace("{n}", hours.toLocaleString(numberLocale(locale)));
}

/**
 * One duration when every option is the same length ("2.5 hours"), otherwise
 * the range ("1–3 hours") — a type's options can differ (a 1-hour and a
 * 3-hour coffee class).
 */
export function formatDurationRange(
  hours: number[],
  copy: Pick<ClassesCopy["detail"], "hourOne" | "hourMany"> & { range: string },
  locale: Locale
): string {
  const min = Math.min(...hours);
  const max = Math.max(...hours);
  if (min === max) return formatHours(min, copy, locale);
  return copy.range
    .replace("{min}", min.toLocaleString(numberLocale(locale)))
    .replace("{max}", max.toLocaleString(numberLocale(locale)));
}
