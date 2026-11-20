export type Locale = "en" | "vi";

export type Landmark = {
  name: string;
  /**
   * Deliberately qualitative ("a short walk from…") rather than an exact
   * time — we don't have verified walking distances yet. Replace with real
   * "N minutes' walk" copy once confirmed; don't invent numbers.
   */
  distance: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HomeCopy = {
  locale: Locale;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    /** Small label above the headline. */
    eyebrow: string;
    h1: string;
    subhead: string;
    /** Longer keyword-rich sentence, shown in the intro section below the hero. */
    tagline: string;
    /** Three short trust points shown as icons under the subhead (desktop). */
    trust: [string, string, string];
  };
  intro: string;
  /** Static safety/security line under the address & hours (which come from LOCATION). */
  security: string;
  landmarks: {
    heading: string;
    items: Landmark[];
  };
  steps: {
    title: string;
    body: string;
  }[];
  rates: {
    heading: string;
    columns: { type: string; hour: string; day: string; week: string };
    note: string;
  };
  faq: {
    heading: string;
    items: FaqItem[];
  };
  findUs: {
    heading: string;
    /** Sits under the heading, above the address card. */
    blurb: string;
    showMap: string;
    openInMaps: string;
    /** iframe title, read by screen readers. */
    mapTitle: string;
  };
};

/** Copy for the "/" homestay landing page introducing both services. */
export type LandingCopy = {
  meta: { title: string; description: string };
  /** Primary nav labels, shared by the site header and the mobile menu. */
  nav: {
    cooking: string;
    rooms: string;
    luggage: string;
    bookNow: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    /** Small caps line above the desktop headline. */
    eyebrow: string;
    /** Desktop headline. Mobile shows the brand name instead (see h1Mobile). */
    h1: string;
    h1Mobile: string;
    /** Tracked-caps line: "Stay · Store · Experience". */
    tagline: string;
    description: string;
    /** Shorter paragraph used on mobile. */
    descriptionMobile: string;
    learnMore: string;
    exploreCta: string;
    imageAlt: string;
  };
  footer: {
    /** "Since {year}" */
    since: string;
    rights: string;
    campuses: string;
    follow: string;
    opensNewTab: string;
  };
  /** One-line description of what each campus is for ("Cooking classes"). */
  campuses: {
    notes: { "campus-1": string; "campus-2": string };
  };
  services: {
    cooking: ServiceCardCopy;
    rooms: ServiceCardCopy;
    luggage: ServiceCardCopy;
  };
};

export type ServiceCardCopy = {
  title: string;
  blurb: string;
  cta: string;
  imageAlt: string;
};

/**
 * Copy for the cooking-classes pages (/classes, /classes/[type],
 * /classes/reserve). Plain strings only (no functions): this object is passed
 * from Server Components into client components, and functions can't cross
 * that boundary. Templates use {n} / {total} / {date} … placeholders that the
 * components fill in. The class text itself (highlights, description, …) is
 * in lib/config.ts and lib/i18n/class-content.ts.
 */
export type ClassesCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    h1: string;
    intro: string;
    reserveCta: string;
    imageAlt: string;
  };
  list: {
    heading: string;
    blurb: string;
    from: string;
    perPerson: string;
    optionsOne: string;
    optionsMany: string;
    viewDetails: string;
    weMeet: string;
  };
  detail: {
    breadcrumb: string;
    highlights: string;
    description: string;
    includes: string;
    excludes: string;
    notSuitableFor: string;
    meetingPoint: string;
    openInMaps: string;
    knowBeforeYouGo: string;
    album: { label: string; previous: string; next: string; open: string };
    allergyNote: string;
    cancellationNote: string;
    /** "{n} hour" / "{n} hours" — one class's length. */
    hourOne: string;
    hourMany: string;
    facts: {
      /** "{min}–{max} hours" — shown when a type's options differ in length. */
      duration: string;
      smallGroup: string;
      cancellation: string;
      languages: string;
    };
  };
  availability: {
    heading: string;
    from: string;
    perPerson: string;
    guests: string;
    removeGuest: string;
    addGuest: string;
    date: string;
    dateHelp: string;
    check: string;
    checking: string;
    stickyCta: string;
    chooseOption: string;
    resultsFor: string;
    guestsOne: string;
    guestsMany: string;
    total: string;
    select: string;
    chooseTimeFirst: string;
    startTime: string;
    noneTitle: string;
    noneHelp: string;
    errorText: string;
    retry: string;
  };
  reserve: {
    heading: string;
    blurb: string;
    change: string;
    required: string;
    name: string;
    email: string;
    whatsapp: string;
    contactHelp: string;
    notes: string;
    notesHelp: string;
    summary: {
      heading: string;
      duration: string;
      date: string;
      time: string;
      guests: string;
      perPerson: string;
      total: string;
      payOnArrival: string;
      meetingPoint: string;
    };
    submit: string;
    submitting: string;
    /** Box on the form: this is a request we confirm over WhatsApp, not a confirmed booking. */
    requestNotice: { title: string; body: string };
    errors: {
      summaryTitle: string;
      name: string;
      email: string;
      contact: string;
      phone: string;
      notes: string;
    };
    invalid: { title: string; body: string; cta: string };
  };
};

/** Copy for the "/rooms" room-booking page. */
export type RoomsCopy = {
  meta: { title: string; description: string };
  hero: { h1: string; subhead: string; tagline: string };
  intro: string;
  amenitiesHeading: string;
  amenities: string[];
  rateHeading: string;
  rateNote: string;
  faq: {
    heading: string;
    items: FaqItem[];
  };
  findUs: HomeCopy["findUs"];
};
