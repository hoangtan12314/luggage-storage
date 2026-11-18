import Link from "next/link";
import { CalendarCheck, ChevronRight, Clock, Languages, Users } from "lucide-react";
import { AvailabilityCard } from "@/components/availability-card";
import { CheckList } from "@/components/check-list";
import { ClassCover } from "@/components/class-cover";
import { MeetingPoint } from "@/components/meeting-point";
import { StickyBookBar } from "@/components/sticky-book-bar";
import { CLASS_FACTS, CLASS_SEATS_PER_SESSION, LOCATION } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { ClassType } from "@/lib/config";
import { classesCopy } from "@/lib/i18n";
import { localizeWorkshop } from "@/lib/i18n/class-content";
import type { Locale } from "@/lib/i18n";
import { formatVnd } from "@/lib/money";
import { buildClassTypeJsonLd, jsonLdScript } from "@/lib/seo";

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );

/**
 * One class type's page, laid out like a tour-booking listing: facts, photo,
 * highlights, description, what's included, meeting point — with the
 * "check availability" booking card beside it (sticky on desktop, inline on
 * mobile with a bottom bar that returns to it).
 */
export function ClassDetailPage({ type, locale }: { type: ClassType; locale: Locale }) {
  const c = classesCopy[locale];
  const base = locale === "en" ? "" : "/vi";
  const text = localizeWorkshop(type.content, locale);
  const { meetingPoint } = type.content;
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";

  const facts = [
    {
      icon: Clock,
      label: fill(c.detail.facts.duration, {
        min: CLASS_FACTS.durationMinHours.toLocaleString(numberLocale),
        max: CLASS_FACTS.durationMaxHours.toLocaleString(numberLocale),
      }),
    },
    {
      icon: Users,
      label: fill(c.detail.facts.smallGroup, { n: CLASS_SEATS_PER_SESSION }),
    },
    {
      icon: CalendarCheck,
      label: fill(c.detail.facts.cancellation, { hours: CLASS_FACTS.freeCancellationHours }),
    },
    { icon: Languages, label: c.detail.facts.languages },
  ];

  const jsonLd = buildClassTypeJsonLd(locale, type.slug);

  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b pb-24 lg:pb-0">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10 lg:pb-20">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[1fr_400px]">
          {/* Header: breadcrumb, title, facts, cover photo */}
          <div>
            <nav aria-label="Breadcrumb" className="text-cocoa-muted flex items-center gap-1.5 text-sm">
              <Link href={`${base}/classes`} className="hover:text-cocoa underline-offset-4 hover:underline">
                {c.detail.breadcrumb}
              </Link>
              <ChevronRight aria-hidden className="size-4" />
              <span aria-current="page" className="text-cocoa">
                {type.title}
              </span>
            </nav>

            <h1 className="font-display mt-4 text-3xl leading-tight font-semibold tracking-tight text-cocoa lg:text-5xl lg:leading-[1.1]">
              {type.title}
            </h1>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {facts.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-cocoa">
                  <Icon aria-hidden className="text-brand-ink size-5 shrink-0" strokeWidth={1.6} />
                  {label}
                </li>
              ))}
            </ul>

            {/* A class with no photo gets a shorter icon panel so the page doesn't open on a big empty block. */}
            <div
              className={cn(
                "relative mt-6 overflow-hidden rounded-3xl border border-white/70 shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]",
                type.image ? "aspect-[16/10]" : "aspect-[16/7] sm:aspect-[16/6]"
              )}
            >
              <ClassCover
                slug={type.slug}
                image={type.image}
                alt={type.image ? type.title : ""}
                sizes="(min-width: 1200px) 740px, (min-width: 1024px) 60vw, 100vw"
                priority
                className="object-[30%_50%]"
                iconClassName="size-28"
              />
            </div>
          </div>

          {/* Booking card: right column on desktop, after the photo on mobile */}
          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-6 lg:self-start">
            <AvailabilityCard
              typeSlug={type.slug}
              options={type.options.map((o) => ({
                id: o.id,
                name: o.name,
                pricePerPerson: o.pricePerPerson,
                availableTimes: o.availableTimes,
              }))}
              fromPrice={type.fromPrice}
              copy={c.availability}
              locale={locale}
              base={base}
              phone={LOCATION.phone}
            />
          </aside>

          {/* Details */}
          <div className="space-y-10 lg:col-start-1 lg:row-start-2">
            <Section title={c.detail.highlights}>
              <CheckList items={text.highlights} />
            </Section>

            <Section title={c.detail.description}>
              <p className="leading-relaxed text-cocoa">{text.description}</p>
            </Section>

            <Section title={c.detail.includes}>
              <CheckList items={text.includes} />
            </Section>

            {text.excludes && text.excludes.length > 0 && (
              <Section title={c.detail.excludes}>
                <CheckList items={text.excludes} variant="cross" />
              </Section>
            )}

            {text.notSuitableFor && text.notSuitableFor.length > 0 && (
              <Section title={c.detail.notSuitableFor}>
                <CheckList items={text.notSuitableFor} variant="cross" />
              </Section>
            )}

            <Section title={c.detail.meetingPoint}>
              <MeetingPoint
                address={meetingPoint.address}
                details={meetingPoint.details}
                openInMaps={c.detail.openInMaps}
              />
            </Section>

            <Section title={c.detail.knowBeforeYouGo}>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-cocoa marker:text-cocoa-muted">
                <li>{c.detail.allergyNote}</li>
                <li>
                  {fill(c.detail.cancellationNote, {
                    hours: CLASS_FACTS.freeCancellationHours,
                    phone: LOCATION.phone,
                  })}
                </li>
              </ul>
            </Section>
          </div>
        </div>
      </div>

      <StickyBookBar
        targetId="availability"
        fromLabel={c.availability.from}
        price={formatVnd(type.fromPrice)}
        cta={c.availability.stickyCta}
      />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-cocoa">
        {title}
      </h2>
      {children}
    </section>
  );
}
