import { BookingWidget } from "@/components/booking-widget";
import { Faq } from "@/components/faq";
import { LuggageHero } from "@/components/luggage-hero";
import { LuggageInfoBar } from "@/components/luggage-info-bar";
import { SIZES } from "@/lib/config";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { formatVnd } from "@/lib/money";
import { buildFaqJsonLd, buildSelfStorageJsonLd, jsonLdScript } from "@/lib/seo";
import type { LockerSize } from "@/lib/types";

type HomePageProps = {
  locale: Locale;
  availability: Partial<Record<LockerSize, number>>;
};

/**
 * Shared content for both / (English) and /vi (Vietnamese) — same
 * components, different copy from lib/i18n, so the two languages can never
 * drift apart in layout, only in the text itself.
 */
export function HomePage({ locale, availability }: HomePageProps) {
  const c = copy[locale];

  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildSelfStorageJsonLd(locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildFaqJsonLd(locale)) }}
      />

      <LuggageHero
        hero={c.hero}
        rates={
          <section className="rounded-3xl border border-white/70 bg-white/70 p-5 text-cocoa shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]">
            <h2 className="font-display text-lg font-semibold tracking-tight">{c.rates.heading}</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-cocoa-muted text-left">
                  <th className="pb-2 font-normal">{c.rates.columns.type}</th>
                  <th className="pb-2 text-right font-normal">{c.rates.columns.hour}</th>
                  <th className="pb-2 text-right font-normal">{c.rates.columns.day}</th>
                  <th className="pb-2 text-right font-normal">{c.rates.columns.week}</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((s) => (
                  <tr key={s.id} className="border-t border-cocoa/10">
                    <td className="py-2.5 font-medium">{s.label}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatVnd(s.hourly)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatVnd(s.daily)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatVnd(s.weekly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-cocoa-muted mt-3 text-xs">{c.rates.note}</p>
          </section>
        }
      >
        <BookingWidget availability={availability} />
      </LuggageHero>

      <LuggageInfoBar copy={c.findUs} />

      <div className="mx-auto max-w-[1200px] px-4 pt-14 pb-16 sm:px-6 lg:px-10 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <ol className="space-y-4">
            {c.steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="bg-gold flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-cocoa">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-cocoa">{step.title}</p>
                  <p className="text-cocoa-muted text-sm">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-cocoa">
              {c.landmarks.heading}
            </h2>
            <ul className="mt-2 space-y-1">
              {c.landmarks.items.map((landmark) => (
                <li key={landmark.name} className="text-cocoa-muted flex items-baseline gap-2 text-sm">
                  <span className="font-medium text-cocoa">{landmark.name}</span>
                  <span>— {landmark.distance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Faq heading={c.faq.heading} items={c.faq.items} tone="cream" />
      </div>
    </main>
  );
}
