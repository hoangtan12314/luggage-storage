import type { Metadata } from "next";
import { LOCATION, SITE_URL, SIZES } from "./config";
import { copy } from "./i18n";
import { mapsLinkUrl } from "./maps";
import type { Locale } from "./i18n";

/**
 * Shared metadata for both root layouts (app/(en)/layout.tsx and
 * app/(vi)/layout.tsx). Each route group is its own root layout with its own
 * metadata tree, so this is spread into both rather than defined once.
 */
export function buildBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    icons: { icon: "/favicon.ico" },
  };
}

/** Per-locale home page metadata: title, description, canonical + hreflang. */
export function buildHomeMetadata(locale: Locale): Metadata {
  const c = copy[locale];
  const path = locale === "en" ? "/" : "/vi";

  return {
    // .absolute ignores the root layout's title.template — c.meta.title is
    // already a complete title (it includes "| Ngõ Saigon" itself), so
    // letting the template apply on top of it would double the suffix.
    title: { absolute: c.meta.title },
    description: c.meta.description,
    alternates: {
      canonical: path,
      languages: {
        en: "/",
        vi: "/vi",
        "x-default": "/",
      },
    },
    openGraph: {
      title: c.meta.title,
      description: c.meta.description,
      url: path,
      siteName: LOCATION.name,
      locale: locale === "en" ? "en_US" : "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: c.meta.title,
      description: c.meta.description,
    },
  };
}

/** Marks a route non-indexable — used by checkout and booking confirmation,
 * which contain guest personal details and must never appear in search. */
export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * SelfStorage (a LocalBusiness subtype) structured data for the home page.
 * Built from LOCATION/SIZES so it can never disagree with what's on the page.
 */
export function buildSelfStorageJsonLd(locale: Locale) {
  const path = locale === "en" ? "/" : "/vi";
  const prices = SIZES.flatMap((s) => [s.hourly, s.daily, s.weekly]);

  return {
    "@context": "https://schema.org",
    "@type": "SelfStorage",
    name: LOCATION.name,
    url: `${SITE_URL}${path}`,
    telephone: LOCATION.phone,
    priceRange: `₫${Math.min(...prices).toLocaleString("en-US")}–₫${Math.max(...prices).toLocaleString("en-US")}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: LOCATION.street,
      addressLocality: LOCATION.district,
      addressRegion: LOCATION.city,
      addressCountry: LOCATION.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: LOCATION.geo.lat,
      longitude: LOCATION.geo.lng,
    },
    areaServed: ["District 1", "Ho Chi Minh City"],
    hasMap: mapsLinkUrl(),
    // TODO: LOCATION.hours is free text ("All day") — once real hours are
    // confirmed, replace with a proper openingHoursSpecification per day.
    makesOffer: buildOfferJsonLd(),
  };
}

/**
 * AggregateOffer built from SIZES — the rate card as structured data.
 * Nested under SelfStorage.makesOffer rather than emitted as its own
 * top-level block, since an offer needs a business/product to attach to.
 * No @context here: only the top-level JSON-LD object needs one.
 */
function buildOfferJsonLd() {
  const prices = SIZES.flatMap((s) => [s.hourly, s.daily, s.weekly]);

  return {
    "@type": "AggregateOffer",
    priceCurrency: "VND",
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: SIZES.length * 3,
  };
}

/** FAQPage structured data, mirroring the on-page FAQ for the given locale. */
export function buildFaqJsonLd(locale: Locale) {
  const { items } = copy[locale].faq;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Serializes JSON-LD for a <script> tag, escaping `<` so injected strings
 * can't break out into HTML/script context. Per the Next.js JSON-LD guide.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
