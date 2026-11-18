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
    h1: string;
    subhead: string;
    tagline: string;
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

/** Copy for the placeholder "/classes" page (real cooking classes come later). */
export type ClassesCopy = {
  meta: { title: string; description: string };
  h1: string;
  body: string;
  cta: string;
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
