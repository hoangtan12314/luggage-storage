import { LOCATION, MAP } from "./config";

/**
 * The place to point at: exact coordinates once MAP.coords is filled in,
 * otherwise the address for Google to geocode. Single source for both the
 * iframe and the outbound link so they can never disagree.
 */
function mapQuery(): string {
  if (MAP.coords) {
    return `${MAP.coords.lat},${MAP.coords.lng}`;
  }
  return `${LOCATION.name}, ${LOCATION.address}`;
}

/**
 * Keyless embed URL for the <iframe>.
 *
 * Note the endpoint: this must be `/maps/embed?pb=…` directly. The more
 * commonly cited `maps.google.com/maps?q=…&output=embed` form 301-redirects
 * here, and that redirect response carries `x-frame-options: SAMEORIGIN`,
 * which browsers apply — so the iframe renders an empty grey box. Requesting
 * the redirect target skips the problem; it responds 200 with no XFO.
 *
 * The `pb` value is Google's positional-parameter encoding; `!1m3!2m1!1s<query>!6i<zoom>`
 * is the shape it generates for a plain place search. `!` separators are
 * structural and must stay unencoded.
 *
 * Deliberately not the Maps Embed API, which would need a Google Cloud
 * project, an API key and a billing account for one static map. If this form
 * ever breaks, switching is a change to this function alone.
 */
export function mapsEmbedUrl(): string {
  const query = encodeURIComponent(mapQuery()).replace(/%20/g, "+");
  return `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${query}!6i17`;
}

/**
 * "Open in Google Maps" target. On phones this hands off to the Maps app for
 * turn-by-turn directions, which is what someone standing on De Tham wants.
 */
export function mapsLinkUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery())}`;
}
