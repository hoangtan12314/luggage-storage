@AGENTS.md

# Ngõ Saigon Homestay

A bilingual (EN/VI) booking site for a real homestay business in District 1, Ho
Chi Minh City, offering two services: **luggage storage** (lockers, by the
hour/day/week) and **room booking** (nightly). Guests check out without an
account and get a reference code; the owner is emailed on every booking.
Payment is collected on arrival, not online — checkout is a reservation, not a
charge (see Payments below).

Prices, branding, locker sizes and the room come from the shop's printed price
list and sample data — `lib/config.ts` is the source of truth for all of it.
Never hardcode the shop's name, address, phone or rates anywhere else.

## Commands

```bash
pnpm dev      # dev server
pnpm build    # production build (also runs TypeScript)
pnpm start    # serve the production build
pnpm lint     # eslint
```

There is no test runner. **Verification is done by building and then walking the
flow in a real browser** — a clean `pnpm build` has shipped a runtime crash in
this project more than once (see Gotchas). Treat "it builds" as necessary, not
sufficient.

## Architecture

Everything swappable sits behind a small interface so it can be replaced without
touching routes:

| Concern | Location | Current implementation |
| --- | --- | --- |
| Booking storage | `lib/data/bookings.ts` | In-memory `Map` on `globalThis` |
| Payments | `lib/payments/` | Mock charge, kept for its `transactionId`; the UI itself says "reserve, pay on arrival" — see Payments below |
| Owner notifications | `lib/notifications/` | Resend, or a console fallback when `RESEND_API_KEY` is unset |

Core domain logic, all framework-free and unit-checkable:

- `lib/pricing.ts` — `quote()` bills luggage at the **cheapest combination** of
  week/day/hour blocks (9 days = 1 week + 2 days, never 9 days). `quoteRoom()`
  is flat `nights × nightly × quantity` — no block-billing, rooms have one rate.
  Both are pure and isomorphic: imported by the client widgets (live price
  preview) and the server action (authoritative price). Must never gain a
  `server-only` import or any I/O.
- `lib/validation.ts` — zod schemas: `selectionSchema` for luggage
  (`items=small:2,large:1`), `roomSelectionSchema` for rooms
  (`checkIn`/`checkOut`/`quantity`, "YYYY-MM-DD" dates).
- `lib/money.ts` — `formatVnd()`. **All** prices render through it.
- `lib/actions.ts` — the `createBooking` server action, branching internally on
  `kind`. Only that one function is exported (see Gotchas).

Two booking flows, sharing checkout and confirmation:

```
/luggage or /vi/luggage → /checkout?items=…&start=…&end=…            → server action → /booking/[ref]
/rooms   or /vi/rooms   → /checkout?kind=room&checkIn=…&checkOut=…&quantity=… → server action → /booking/[ref]
```

`Booking` (`lib/types.ts`) is tagged with `kind: "luggage" | "room"` and carries
optional kind-specific fields (`items` vs `roomQuantity`) rather than being a
strict discriminated union — deliberately, so the shared plumbing (repository,
notifications, confirmation page) stays one code path with a `kind` branch at
the few points that actually differ. Narrow on `kind` before reading `items` or
`roomQuantity`. `Quote`/`RoomQuote` are similarly tagged (`AnyQuote`), and
`OrderSummary`/`CheckoutForm` render either.

**The URL is untrusted**, for both kinds. `/checkout` re-parses and re-prices
it, and `createBooking` independently re-validates, re-prices and re-checks
availability before persisting. A tampered `price=` in the query string can
never affect the stored total. Keep it that way when adding a third service.

### Payments — checkout is a reservation, not a charge

The business collects payment in person, not online. `lib/payments/` (a mock
charge) is still called and its `transactionId` still stored, but this is
vestigial — nothing in the UI claims money changed hands. The checkout button
reads "Reserve — pay {amount} on arrival", and the confirmation page says "Pay
on arrival." If you touch checkout, preserve that framing; don't let it drift
back to sounding like an online charge happened.

## Routing: three pages per language, two root layouts

There is **no top-level `app/layout.tsx`**. Route groups give each language its
own root layout and correct `<html lang>`:

```
app/(en)/   layout.tsx → <html lang="en">
            page.tsx           → /            (landing: introduces both services)
            luggage/page.tsx   → /luggage     (the original single-page site; SEO lives here)
            rooms/page.tsx     → /rooms
            checkout/, booking/[ref]/          (shared by both kinds, English-only)
app/(vi)/   layout.tsx → <html lang="vi">
            vi/page.tsx           → /vi
            vi/luggage/page.tsx   → /vi/luggage
            vi/rooms/page.tsx     → /vi/rooms
app/        robots.ts, sitemap.ts, globals.css, favicon.ico   (shared, outside both groups)
```

Consequences when adding routes:

- A new page must go **inside one of the groups**, or it will have no root layout.
- Route groups are stripped from URLs, so a page at `app/(vi)/page.tsx` would
  resolve to `/` and collide with `(en)`. The `/vi/*` paths exist because of the
  literal `vi/` folder inside the `(vi)` group.
- Checkout and booking confirmation live only under `(en)` and are
  English-only by design — they're `noindex`, so there is no SEO cost. So is
  the booking widgets' own UI chrome (buttons, labels like "Check-in") on both
  the luggage and room pages — only the surrounding page content (hero, FAQ,
  intro) is translated. Don't assume every string on `/vi/rooms` is Vietnamese.
- `components/home-page.tsx` renders the luggage page in both languages;
  `components/rooms-page.tsx` renders rooms; `components/landing-page.tsx`
  renders the landing page. Copy lives in `lib/i18n/` — `copy` (luggage,
  historically named `HomeCopy`), `roomsCopy`, `landingCopy`.
- **Switching language must preserve the current page**, not just go to that
  locale's home — `/rooms` → Vietnamese should land on `/vi/rooms`, not `/vi`.
  Both `LanguageSwitcher` and `SiteFooter` compute this via
  `lib/i18n-routes.ts`'s `localizedPath()`. If you add a fourth page, make sure
  it round-trips there too, or the language switcher silently regresses to
  dropping people on the wrong page (this happened once already, while adding
  the rooms page).

## Gotchas that have actually broken this project

- **`lib/actions.ts` has `"use server"` and may export only async functions.**
  Exporting a plain object from it crashed checkout in production. The form-state
  constants live in `lib/booking-form-state.ts` for exactly this reason. The file
  now has two internal branches (`createLuggageBooking`, `createRoomBooking`) —
  neither is exported, only the top-level `createBooking` is.
- **`countAvailable`/`countRoomsAvailable` sum quantities, they do not count
  booking rows.** One booking can hold three lockers or three rooms. Counting
  rows silently oversells. `countRoomsAvailable` must also exclude cancelled
  bookings if a cancellation status is ever added — it doesn't exist yet, so
  every reservation currently holds stock forever.
- **`formatVnd` uses comma grouping, not `Intl` `vi-VN`.** The `vi-VN` locale
  renders `260.000 ₫` with dots; the shop's own poster and price list use commas.
- **Don't put `₫` in `next/og` images.** Satori's font fetching has no glyph for it
  and renders a tofu box — every `opengraph-image.tsx` (landing, luggage, rooms)
  spells out "VND" instead. The real pages render `₫` fine.
- **Page titles use `title.absolute`.** Every page's `meta.title` already ends in
  "| Ngõ Saigon", so letting the layout's `title.template` apply on top would
  double the suffix. `lib/seo.ts`'s `buildPageMetadata()` handles this once for
  all three page types.
- **Home/luggage/rooms pages are `revalidate = 60`, not `force-dynamic`.**
  Availability may be up to a minute stale, which is safe because the action
  re-checks at submit.
- **`text-brand` is not readable as text** — `--brand` (`#f9a61c`) is a fill
  colour: 2.0:1 contrast against white, below even the 3:1 non-text minimum.
  Use `text-brand-ink` for prices/links/icons on a light background instead
  (`--brand-ink`, ~5:1). `--brand` stays fine as a *fill* (border, background),
  and text sitting *on* a `--brand` fill should use `--brand-foreground`
  (near-black). See the comment block above the tokens in `app/globals.css`.
- The Resend client is constructed **lazily inside** `notifyNewBooking` —
  `lib/notifications/index.ts` imports the module unconditionally, and the Resend
  constructor throws on a missing key.
- After moving route files, `rm -rf .next` — stale generated route types fail the
  build with phantom "cannot find module" errors.
- OG image paths in dev/build output carry a hash suffix
  (`/rooms/opengraph-image-l7yu9j`, not `/rooms/opengraph-image`) — check the
  build's route list rather than guessing the URL when testing one directly.

## Data limitations to be aware of

The in-memory store resets on every restart and is **not** correct across
multiple serverless instances — this now applies to rooms as well as luggage.
Swapping `lib/data/bookings.ts` for a real database (SQLite/Postgres) is the
main prerequisite before this takes real bookings; the repository surface was
kept narrow (`createBooking`, `findByRef`, `findOverlapping`/`countAvailable`
for luggage, `findOverlappingRooms`/`countRoomsAvailable` for rooms) so this is
a scoped change, not a rewrite. There is no admin UI yet for editing prices or
seeing a day's bookings — both rate tables live in `lib/config.ts` as plain
constants (`SIZES`, `ROOM`), and a family member wanting to see today's
arrivals currently has no page for that. This was deliberately deferred; see
the plan file history for the fuller design (Postgres schema, staff login, a
day-view) if picking it up later.

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
- **Everything in `ROOM`** (`lib/config.ts`) — nightly rate (450,000 ₫),
  capacity, amenities, check-in/out times. All sample data pending a real
  decision from the owner; `RoomsCopy.rateNote` in both languages already says
  so on the page itself. Don't treat `ROOM.nightly` as a real price.
- Opening hours (currently the free text "All day"; JSON-LD has no
  `openingHoursSpecification` until this is confirmed).
- Geo coordinates (a central District 1 placeholder, shared by both the
  `SelfStorage` and `LodgingBusiness` JSON-LD).
- Walking times to Ben Thanh Market / Bui Vien — `lib/i18n/` deliberately uses
  qualitative phrasing ("walking distance") rather than fabricated minutes.
- No `aggregateRating` in either service's JSON-LD, and none should be added
  until real reviews exist — inventing them violates Google's guidelines.
