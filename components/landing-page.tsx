import { BedDouble, ChefHat, Luggage } from "lucide-react";
import { CampusesMap } from "@/components/campuses-map";
import { LandingHero } from "@/components/landing-hero";
import { ServiceCard } from "@/components/service-card";
import { copy, landingCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

/**
 * The "/" and "/vi" landing page: hero, the three service cards, then the
 * Find Us map. No booking widget lives here — only entry points, so a
 * first-time visitor picks a service before being asked any booking
 * question. The cream background is scoped to this page (the booking pages
 * stay white).
 */
export function LandingPage({ locale }: { locale: Locale }) {
  const c = landingCopy[locale];
  const base = locale === "en" ? "" : "/vi";
  const findUs = copy[locale].findUs;

  return (
    <main className="flex-1">
      <div className="from-cream to-cream-2 bg-gradient-to-b">
        <LandingHero copy={c} base={base} />

        <section
          id="services"
          aria-label={c.hero.tagline}
          className="mx-auto max-w-[1500px] scroll-mt-6 px-4 pb-10 sm:px-6 lg:px-14 lg:pt-12"
        >
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <ServiceCard
              href={`${base}/classes`}
              icon={ChefHat}
              image="/cooking-class-service.jpg"
              copy={c.services.cooking}
            />
            <ServiceCard
              href={`${base}/rooms`}
              icon={BedDouble}
              image="/accommodation-service.jpg"
              copy={c.services.rooms}
            />
            <ServiceCard
              href={`${base}/luggage`}
              icon={Luggage}
              image="/luggage-service.jpg"
              copy={c.services.luggage}
            />
          </div>
        </section>

        <div
          aria-hidden
          className="mx-auto hidden max-w-[1500px] items-center gap-8 px-14 pb-10 text-xs tracking-[0.35em] text-cocoa-muted uppercase lg:flex"
        >
          <span className="h-px flex-1 bg-cocoa/20" />
          {c.hero.tagline}
          <span className="h-px flex-1 bg-cocoa/20" />
        </div>
      </div>

      <div className="bg-cream-2 border-t border-cocoa/10">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <CampusesMap copy={findUs} notes={c.campuses.notes} locale={locale} />
        </div>
      </div>
    </main>
  );
}
