import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClassTypeCard } from "@/components/class-type-card";
import { HeroPhoto } from "@/components/hero-photo";
import { MeetingPoint } from "@/components/meeting-point";
import { CLASS_TYPES } from "@/lib/config";
import { classesCopy } from "@/lib/i18n";
import { localizeWorkshop } from "@/lib/i18n/class-content";
import type { Locale } from "@/lib/i18n";
import { buildClassesJsonLd, jsonLdScript } from "@/lib/seo";

/**
 * The "/classes" page: hero, then the three class types. Each card leads to
 * the type's own page, where guests check availability and pick an option —
 * there is no booking form on this page.
 */
export function ClassesPage({ locale }: { locale: Locale }) {
  const c = classesCopy[locale];
  const base = locale === "en" ? "" : "/vi";
  const meeting = CLASS_TYPES[0].content.meetingPoint;

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildClassesJsonLd(locale)) }}
      />

      <div className="from-cream to-cream-2 bg-gradient-to-b">
        <section className="lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <HeroPhoto src="/big-cover.jpg" alt={c.hero.imageAlt} />

          <div className="relative -mt-12 px-6 pb-10 sm:px-10 lg:mt-0 lg:pl-12 lg:pr-8 lg:py-10">
            <p className="hidden items-center gap-5 text-sm font-medium tracking-[0.3em] text-cocoa lg:flex">
              {c.hero.eyebrow}
              <span aria-hidden className="h-px w-28 bg-cocoa/50" />
            </p>
            <h1 className="font-display text-[2.5rem] leading-[1.1] font-semibold tracking-tight text-cocoa lg:mt-6 lg:text-[3.25rem] lg:leading-[1.08]">
              {c.hero.h1}
            </h1>
            <span aria-hidden className="bg-gold mt-5 block h-0.5 w-16 lg:hidden" />
            <p className="mt-5 max-w-xl text-lg leading-snug text-cocoa-muted lg:mt-6 lg:text-xl lg:text-cocoa">
              {c.hero.intro}
            </p>

            <Link
              href="#classes"
              className="bg-gold focus-visible:ring-ring mt-8 inline-flex min-h-12 items-center gap-3 rounded-full px-6 text-[15px] font-medium whitespace-nowrap text-cocoa shadow-sm transition-[filter] duration-200 outline-none hover:brightness-95 focus-visible:ring-2"
            >
              {c.hero.reserveCta}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>
        </section>

        <section
          id="classes"
          aria-labelledby="classes-heading"
          className="mx-auto max-w-[1500px] scroll-mt-6 px-4 pt-12 pb-12 sm:px-6 lg:px-14 lg:pt-16"
        >
          <h2
            id="classes-heading"
            className="font-display text-3xl font-semibold tracking-tight text-cocoa lg:text-4xl"
          >
            {c.list.heading}
          </h2>
          <p className="text-cocoa-muted mt-2 text-lg">{c.list.blurb}</p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-6">
            {CLASS_TYPES.map((type) => (
              <ClassTypeCard
                key={type.slug}
                type={type}
                highlight={localizeWorkshop(type.content, locale).highlights[0]}
                copy={c.list}
                href={`${base}/classes/${type.slug}`}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-14 lg:pb-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-cocoa">
            {c.list.weMeet}
          </h2>
          <MeetingPoint
            className="mt-4"
            address={meeting.address}
            details={meeting.details}
            openInMaps={c.detail.openInMaps}
          />
        </section>
      </div>
    </main>
  );
}
