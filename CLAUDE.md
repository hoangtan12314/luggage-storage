@AGENTS.md

# Ngõ Saigon Homestay

A bilingual (EN/VI) booking site for a real homestay business in District 1, Ho
Chi Minh City, offering three services: **luggage storage** (lockers, by the
hour/day/week), **room booking** (nightly) and **cooking classes** (per person,
per start time). Guests check out without an
account and get a reference code; the owner is emailed on every booking.
Payment is collected on arrival, not online — checkout is a reservation, not a
charge (see Payments below).

Prices, branding, locker sizes, the room and the cooking workshops come from the
shop's printed price list, the owner's workshop list and sample data — `lib/config.ts` is the source of truth for all of it.
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
  `quoteClass()` is flat `pricePerPerson × people`.
  Both are pure and isomorphic: imported by the client widgets (live price
  preview) and the server action (authoritative price). Must never gain a
  `server-only` import or any I/O.
- `lib/validation.ts` — zod schemas: `selectionSchema` for luggage
  (`items=small:2,large:1`), `roomSelectionSchema` for rooms
  (`checkIn`/`checkOut`/`quantity`, "YYYY-MM-DD" dates), and for classes
  `classSelectionSchema` (workshop, date, time, people) plus
  `classCustomerSchema` (phone **or** WhatsApp — at least one — plus email;
  the group error is on the `contact` path).
- `lib/class-dates.ts` — "tomorrow"/"+90 days" in the **shop's timezone**
  (`LOCATION.timezone`), pure and shared by the form and the server action.
- `lib/money.ts` — `formatVnd()`. **All** prices render through it.
- `lib/actions.ts` — the `createBooking` server action, branching internally on
  `kind`. Only that one function is exported (see Gotchas).

Three booking flows. Luggage and rooms share `/checkout`; classes have their own
multi-step flow modelled on a tour-booking listing (class page → check
availability → pick an option + time → contact form), and all three share the
confirmation page:

```
/luggage or /vi/luggage → /checkout?items=…&start=…&end=…            → server action → /booking/[ref]
/rooms   or /vi/rooms   → /checkout?kind=room&checkIn=…&checkOut=…&quantity=… → server action → /booking/[ref]
/classes → /classes/[type] (check availability, pick option+time) → /classes/reserve?workshop=&date=&time=&people= → server action → /booking/[ref]
         (and the same under /vi/classes…)
```

`Booking` (`lib/types.ts`) is tagged with `kind: "luggage" | "room" | "class"` and carries
optional kind-specific fields (`items`, `roomQuantity`, or `workshopId`/`people`/`classTime`/`unitPrice`) rather than being a
strict discriminated union — deliberately, so the shared plumbing (repository,
notifications, confirmation page) stays one code path with a `kind` branch at
the few points that actually differ. Narrow on `kind` before reading `items`, `roomQuantity` or
the class fields. `CustomerDetails.phone` is optional because a class guest may
give only WhatsApp (luggage/room schemas still require it). `Quote`/`RoomQuote` are similarly tagged (`AnyQuote`), and
`OrderSummary`/`CheckoutForm` render either.

**The URL is untrusted**, for both kinds. `/checkout` re-parses and re-prices
it, and `createBooking` independently re-validates, re-prices and re-checks
availability before persisting. A tampered `price=` in the query string can
never affect the stored total. Keep it that way when adding a third service.

### Requests, not bookings — the owner confirms (all three kinds)

A guest submitting checkout/reserve is sending a **request**; nothing is confirmed
until the owner agrees it with them (usually on WhatsApp). The flow:

1. The form shows a `RequestNotice` box ("You're placing a request … we'll contact you on
   WhatsApp to confirm, then email you") and the button says "Send request".
2. `createBooking` saves it and calls `finish()` (`lib/actions.ts`): emails the owner
   a **request** email with a WhatsApp link (`wa.me`) and a **"Confirm & email the guest"**
   link, then redirects the guest to `/booking/[ref]?t=<token>` ("Request received").
3. The owner opens the link → `/confirm/[token]` (noindex) shows the request and a
   Confirm button (a POST — opening the link alone never confirms, so mail scanners can't
   trigger it). `confirmBooking` (`lib/confirm-actions.ts`) emails the guest "you're
   confirmed, see you soon" (`buildCustomerConfirmationEmail`, reply-to = NOTIFY_EMAIL).

**No database involved:** the link and the request page carry the booking itself in an
HMAC-signed token (`lib/confirm-token.ts`), so they work on serverless where the
in-memory store isn't shared. There is no confirmed/pending status stored, so pressing
Confirm twice emails the guest twice (the page warns). Env vars: `BOOKING_CONFIRM_SECRET`
(required in production — without it no confirm link is made; dev uses a fixed fallback),
`EMAIL_FROM` (e.g. `Ngõ Saigon <bookings@ngosaigon.com>`, needs ngosaigon.com verified in
Resend — Resend's test sender can only email the account owner), `NOTIFY_EMAIL`,
`NEXT_PUBLIC_SITE_URL` (the confirm link is built from it). When testing locally run with
`RESEND_API_KEY=` empty so emails are logged, not sent.

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
            classes/page.tsx          → /classes            (hero + the 3 class types)
            classes/[type]/page.tsx   → /classes/coffee|cocoa|spring-roll (detail + availability card; static, unknown slug = 404)
            classes/reserve/page.tsx  → /classes/reserve    (contact form; dynamic, noindex)
            checkout/, booking/[ref]/          (luggage+room checkout / all kinds' confirmation, English-only)
app/(vi)/   layout.tsx → <html lang="vi">
            vi/page.tsx           → /vi
            vi/luggage/page.tsx   → /vi/luggage
            vi/rooms/page.tsx     → /vi/rooms
            vi/classes/page.tsx, vi/classes/[type]/page.tsx, vi/classes/reserve/page.tsx
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
- **`countAvailable`/`countRoomsAvailable` sum quantities
  (`people` for classes), they do not count booking rows.** One booking can hold three lockers or three rooms. Counting
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

- **Classes have no seat limit.** Every start time is always open; the owner confirms each
  request by hand. Only a single booking is capped (`MAX_PEOPLE_PER_BOOKING` = 5). The type
  is `Workshop.icon`; `CLASS_TYPES` groups `WORKSHOPS` by it, so adding a workshop with an
  existing `icon` makes it another option of that class page.
- **`/classes` and `/classes/[type]` are statically generated**, so "tomorrow"
  must never be computed during render: `AvailabilityCard` reads it on the client
  via `useSyncExternalStore` (empty on the server). The server action re-checks
  with `classDateBounds()` in the shop's timezone. `/classes/reserve` is dynamic
  (it reads the query string) and re-validates at render.
- **The class reserve form dispatches `createBooking` manually**
  (`startTransition(() => formAction(data))`), not via `<form action>`: React
  resets a form after its action runs, which would wipe everything typed
  whenever the server rejects it.
- **`/classes/[type]` uses `dynamicParams = false`** so unknown slugs are a real
  404 (removing it returns a soft 200). Next logs a benign "NoFallbackError" for them.
- **Vietnamese is temporarily OFF** (`VIETNAMESE_ENABLED = false` in
  `lib/config.ts`). The language switcher is hidden everywhere (header, mobile menu,
  footer), `/vi` and `/vi/*` redirect (307) to the English page via `next.config.ts`,
  and `/vi` is left out of the sitemap, robots allow-list and hreflang. All the
  Vietnamese pages and copy are still in the repo — set the flag to `true` to bring
  them back (and the redirects stop automatically).
- **Two campuses** (`CAMPUSES` in `lib/config.ts`): **Campus 1** = 104/23 Bùi Viện
  (where the classes meet), **Campus 2** = 199/14 Đề Thám (the existing homestay,
  i.e. `LOCATION`: rooms and luggage). **Addresses are per language and never
  abbreviated** (`campus.address.en` / `.vi`; `LOCATION.address` is the English
  Campus 2 one); a class's `meetingPoint` is just `{ campus }` and its address comes
  from the campus via `getMeetingAddress(mp, locale)`. TODO: confirm the ward names
  (Phạm Ngũ Lão for Campus 1, Bến Thành for Campus 2 — taken from the owner's data).
  Both campuses share `LOCATION`'s phone and hours until per-campus values exist.
  Class pages label the meeting point with its campus; the owner email for a class
  ends with its campus address. The landing page's "Find us" (`CampusesMap`) and
  the footer list both campuses; the luggage and rooms pages still use the
  single-location `FindUsMap` (Campus 2). Maps queries use the Vietnamese address
  (Google finds it most reliably) whatever the page language.
- **Footer** (`site-footer.tsx`) uses the cream/cocoa/gold style like the header:
  logo + "Since 2021", campus cards, social pills, and the © line.
- **Workshops** (`WORKSHOPS` in `lib/config.ts`): the owner's real data (names,
  prices, times, **durations** — 1 h for the standard coffee/cocoa classes, 3 h
  for the "4 Types" ones, 1.5 h for the plain spring roll (499,000 ₫) and 2.5 h for fresh & fried (899,000 ₫) — highlights, description,
  includes, meeting point). A class page shows one duration, or a range ("1–3
  hours") when its options differ; each option card shows its own. Heads-up: the
  3-hour classes' start times (every 2 h) overlap, which is fine as there is no seat limit. Still to confirm:
  `CLASS_FACTS` (free cancellation 24 h) and the instructor languages were copied
  from the owner's GetYourGuide *spring-roll* listing and applied to every class;
  the Vietnamese class text in `lib/i18n/class-content.ts` is a draft translation
  awaiting the owner's review; the last cocoa "includes" line was truncated in the
  supplied text and completed as "Vegan options available upon request". Cocoa
  and spring-roll have no photo (icon panel) — don't reuse the coffee photo for
  them. Free cancellation is a policy statement only (no cancel feature).
  Reviews/ratings from GetYourGuide are not republished.
- **Luggage page** (`/luggage`, `/vi/luggage`) uses the cream/cocoa/gold design from
  `ui-sample/luggage-ui*.png`: `LuggageHero` (suitcase photo faded behind the headline,
  booking card as the second column), `LuggageInfoBar` (address/hours/phone + click-to-load
  map, replaces `FindUsMap` here), then intro/rates/FAQ (`Faq tone="cream"`). The header
  floats over the hero on mobile (`isHome` includes the luggage paths). `BookingWidget`
  reads the default drop-off/pick-up on the client (`useSyncExternalStore`) — the page is
  cached, so computing "now" in render caused a hydration mismatch. The hero photo
  `public/luggage-service.jpg` is only 678 px wide (a larger one would look sharper).
  `/checkout` (luggage + rooms) now uses the same cream style: `CheckoutForm` is a two-column form+summary like the class reserve form (manual `startTransition` dispatch, error summary, client validation) and takes the server-rendered summary as a prop. `/rooms` and the `/booking/[ref]` confirmation still use the older white style.
- **Class albums** (`lib/albums.ts`, `components/album-carousel.tsx`): a class's photo
  album is just the folder `public/albums/<coffee|cocoa|spring-roll>/` — every image in
  it, in filename order (`01-…`, `02-…`), optional `captions.json` (`{"01-x.jpg": "alt"}`)
  for alt text. Size is read at build time (the class pages are static, so adding photos
  means a redeploy; reading `public/` at runtime would not work on Vercel). With photos
  the class detail page shows the carousel (Embla;
  one photo at a time in a fixed frame, wide photos cover it, portrait ones sit whole over a blurred copy; a 4 s timer with our own
  `setInterval`, paused on hover/keyboard focus/lightbox/hidden tab/reduced motion;
  click opens `yet-another-react-lightbox`) instead of the single `image`; an empty
  folder falls back to the old cover/icon panel. Run **`pnpm photos`** after adding files:
  converts HEIC (macOS `sips`), applies rotation, resizes to ≤2000 px, strips EXIF/GPS,
  recompresses — idempotent. The card posters on `/classes` are separate (`CLASS_POSTERS`
  in `lib/config.ts`). Gotcha: in `next dev`, open the site via `localhost`, not
  `127.0.0.1` — the latter is a blocked dev origin and the page never hydrates.
- **Social links** (`SOCIAL_LINKS` in `lib/config.ts`): only links with a URL are
  shown in the footer. Facebook, Instagram and Klook URLs are still empty (TODO);
  GetYourGuide points at the spring-roll listing. `ESTABLISHED_YEAR` (2021) drives
  the "Since 2021" badge and the © range, whose end year is read on the client.
- Opening hours (currently the free text "All day"; JSON-LD has no
  `openingHoursSpecification` until this is confirmed).
- Geo coordinates (a central District 1 placeholder, shared by both the
  `SelfStorage` and `LodgingBusiness` JSON-LD).
- Walking times to Ben Thanh Market / Bui Vien — `lib/i18n/` deliberately uses
  qualitative phrasing ("walking distance") rather than fabricated minutes.
- No `aggregateRating` in either service's JSON-LD, and none should be added
  until real reviews exist — inventing them violates Google's guidelines.

## Layout notes

- The hero (`landing-hero.tsx`, `classes-page.tsx`) is capped at `max-w-[1500px]`
  like the header and cards, so the photo stops growing on very wide screens;
  from the `2xl` breakpoint `HeroPhoto` also rounds its left corners. (Use `2xl:`,
  not `min-[1500px]:` — the arbitrary variant sorts before `lg:` and loses.)
