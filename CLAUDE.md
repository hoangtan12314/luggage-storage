@AGENTS.md

# Ngõ Saigon Luggage Storage

A bilingual (EN/VI) booking site for a real luggage-storage business in District 1,
Ho Chi Minh City. Travellers pick locker sizes and a time range, check out as a
guest, and get a reference code; the owner is emailed on every booking.

Prices, branding and the two locker sizes come from the shop's printed price list —
`lib/config.ts` is the source of truth for all of it. Never hardcode the shop's
name, address, phone or rates anywhere else.

## Commands

```bash
pnpm dev      # dev server
pnpm build    # production build (also runs TypeScript)
pnpm start    # serve the production build
pnpm lint     # eslint
```

There is no test runner. **Verification is done by building and then walking the
flow in a real browser** — twice in this project's history a clean `pnpm build`
still shipped a runtime crash (see Gotchas). Treat "it builds" as necessary, not
sufficient.

## Architecture

Everything swappable sits behind a small interface so it can be replaced without
touching routes:

| Concern | Location | Current implementation |
| --- | --- | --- |
| Booking storage | `lib/data/bookings.ts` | In-memory `Map` on `globalThis` |
| Payments | `lib/payments/` | Mock (`mock.ts`); real provider drops into `index.ts` |
| Owner notifications | `lib/notifications/` | Resend, or a console fallback when `RESEND_API_KEY` is unset |

Core domain logic, all framework-free and unit-checkable:

- `lib/pricing.ts` — bills the **cheapest combination** of week/day/hour blocks
  (9 days = 1 week + 2 days, never 9 days). Pure and isomorphic: imported by both
  the client widget (live price preview) and the server action (authoritative
  price). Must never gain a `server-only` import or any I/O.
- `lib/validation.ts` — zod schemas. The selection travels in the URL as
  `items=small:2,large:1`, parsed here.
- `lib/money.ts` — `formatVnd()`. **All** prices render through it.
- `lib/actions.ts` — the `createBooking` server action.

Booking flow: `/` or `/vi` → `/checkout?items=…&start=…&end=…` → server action →
`/booking/[ref]`.

**The URL is untrusted.** `/checkout` re-parses and re-prices it, and
`createBooking` independently re-validates, re-prices and re-checks availability
before charging. A tampered `price=` in the query string can never affect what is
charged. Keep it that way.

## Routing: two root layouts

There is **no top-level `app/layout.tsx`**. Route groups give each language its own
root layout and correct `<html lang>`:

```
app/(en)/   layout.tsx → <html lang="en">, page.tsx → /, checkout/, booking/[ref]/
app/(vi)/   layout.tsx → <html lang="vi">, vi/page.tsx → /vi
app/        robots.ts, sitemap.ts, globals.css, favicon.ico   (shared, outside both groups)
```

Consequences when adding routes:

- A new page must go **inside one of the groups**, or it will have no root layout.
- Route groups are stripped from URLs, so a page at `app/(vi)/page.tsx` would
  resolve to `/` and collide with `(en)`. The `/vi` path exists because of the
  literal `vi/` folder inside the group.
- Checkout and booking live only under `(en)` and are English-only by design —
  they're `noindex`, so there is no SEO cost.
- `components/home-page.tsx` renders both languages; copy lives in `lib/i18n/`.

## Gotchas that have actually broken this project

- **`lib/actions.ts` has `"use server"` and may export only async functions.**
  Exporting a plain object from it crashed checkout in production. The form-state
  constants live in `lib/booking-form-state.ts` for exactly this reason.
- **`countAvailable` sums item quantities, it does not count booking rows.** One
  booking can hold three lockers. Counting rows silently oversells.
- **`formatVnd` uses comma grouping, not `Intl` `vi-VN`.** The `vi-VN` locale
  renders `260.000 ₫` with dots; the shop's own poster and price list use commas.
- **Don't put `₫` in `next/og` images.** Satori's font fetching has no glyph for it
  and renders a tofu box — `app/(en)/opengraph-image.tsx` spells out "VND". The
  real pages render `₫` fine.
- **Page titles use `title.absolute`.** `lib/i18n` titles already end in
  "| Ngõ Saigon", so letting the layout's `title.template` apply would double the
  suffix.
- **Home pages are `revalidate = 60`, not `force-dynamic`.** Availability may be up
  to a minute stale, which is safe because the action re-checks at submit.
- The Resend client is constructed **lazily inside** `notifyNewBooking` —
  `lib/notifications/index.ts` imports the module unconditionally, and the Resend
  constructor throws on a missing key.
- After moving route files, `rm -rf .next` — stale generated route types fail the
  build with phantom "cannot find module" errors.

## Data limitations to be aware of

The in-memory store resets on every restart and is **not** correct across multiple
serverless instances. Swapping `lib/data/bookings.ts` for a real database
(SQLite/Postgres) is the main prerequisite before this takes real bookings; the
repository surface (`createBooking`, `findByRef`, `findOverlapping`,
`countAvailable`) was kept narrow so this is a one-file change.

## Environment

`.env.local` (gitignored; see `.env.local.example`):

- `RESEND_API_KEY` — unset falls back to logging notifications to the console.
- `NOTIFY_EMAIL` — where booking notifications go. Resend's shared
  `onboarding@resend.dev` sender can only reach the Resend account's own signup
  address unless a custom domain is verified.
- `NEXT_PUBLIC_SITE_URL` — drives canonical URLs, sitemap, robots and JSON-LD via
  `SITE_URL` in `lib/config.ts`. Falls back to `https://example.com`.

## Placeholders awaiting real values

Marked `TODO` in `lib/config.ts` unless noted — do not invent values for these:

- Locker inventory counts (currently 20 small / 10 large).
- Opening hours (currently the free text "All day"; JSON-LD has no
  `openingHoursSpecification` until this is confirmed).
- Geo coordinates (a central District 1 placeholder).
- Walking times to Ben Thanh Market / Bui Vien — `lib/i18n/` deliberately uses
  qualitative phrasing ("walking distance") rather than fabricated minutes.
- No `aggregateRating` in the JSON-LD, and none should be added until real reviews
  exist — inventing them violates Google's guidelines.
