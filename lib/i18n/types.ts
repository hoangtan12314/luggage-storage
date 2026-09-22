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
  hero: { h1: string; tagline: string };
  services: {
    luggage: { title: string; blurb: string; cta: string; priceFrom: string };
    rooms: { title: string; blurb: string; cta: string; priceFrom: string };
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
