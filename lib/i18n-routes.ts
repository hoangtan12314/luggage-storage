import type { Locale } from "./i18n";

/**
 * Given the current pathname and a target locale, returns the equivalent
 * page in that locale — /luggage <-> /vi/luggage, /rooms <-> /vi/rooms,
 * / <-> /vi — not just the site root. Used by both the header dropdown and
 * the footer language links so switching language keeps the visitor on the
 * same page instead of bouncing them to the landing page.
 *
 * Checkout and booking confirmation are English-only by design (see
 * CLAUDE.md) and have no /vi counterpart, so those fall back to that
 * locale's landing page.
 */
export function localizedPath(pathname: string, target: Locale): string {
  const enPath = pathname.startsWith("/vi")
    ? pathname === "/vi"
      ? "/"
      : pathname.slice("/vi".length) || "/"
    : pathname;

  const translatable =
    enPath === "/" || enPath.startsWith("/luggage") || enPath.startsWith("/rooms");

  if (!translatable) {
    return target === "en" ? "/" : "/vi";
  }

  if (target === "en") return enPath;
  return enPath === "/" ? "/vi" : `/vi${enPath}`;
}
