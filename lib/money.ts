/**
 * Formats VND for display, e.g. 260000 -> "260,000 ₫".
 *
 * Deliberately not `Intl.NumberFormat("vi-VN")`: that renders "260.000 ₫" with
 * dot separators, while the shop's own poster and price list use commas.
 * Matching the printed materials matters more than locale convention here.
 */
export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(Math.round(amount))} ₫`;
}
