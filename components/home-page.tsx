import { MapPin, Clock, ShieldCheck } from "lucide-react";
import { BookingWidget } from "@/components/booking-widget";
import { Faq } from "@/components/faq";
import { FindUsMap } from "@/components/find-us-map";
import { Card } from "@/components/ui/card";
import { LOCATION, SIZES } from "@/lib/config";
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
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildSelfStorageJsonLd(locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildFaqJsonLd(locale)) }}
      />

      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              {c.hero.h1}
            </h1>
            <p className="text-foreground mt-3 text-xl font-medium">{c.hero.subhead}</p>
            <p className="text-muted-foreground mt-4 text-lg">{c.hero.tagline}</p>

            <div className="mt-6 space-y-3">
              {(
                [
                  [MapPin, LOCATION.address],
                  [Clock, LOCATION.hours],
                  [ShieldCheck, c.security],
                ] as const
              ).map(([Icon, text], i) => (
                <p key={i} className="text-muted-foreground flex items-center gap-2.5 text-sm">
                  <Icon className="text-brand size-4 shrink-0" />
                  {text}
                </p>
              ))}
            </div>

            <p className="text-muted-foreground mt-6 text-sm leading-relaxed">{c.intro}</p>

            <div className="mt-6">
              <h2 className="text-sm font-semibold">{c.landmarks.heading}</h2>
              <ul className="mt-2 space-y-1">
                {c.landmarks.items.map((landmark) => (
                  <li key={landmark.name} className="text-muted-foreground flex items-baseline gap-2 text-sm">
                    <span className="text-foreground font-medium">{landmark.name}</span>
                    <span>— {landmark.distance}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ol className="mt-8 space-y-4">
              {c.steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="bg-brand text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-sm">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Card className="mt-8 p-6">
              <h2 className="font-semibold">{c.rates.heading}</h2>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="pb-2 font-normal">{c.rates.columns.type}</th>
                    <th className="pb-2 text-right font-normal">{c.rates.columns.hour}</th>
                    <th className="pb-2 text-right font-normal">{c.rates.columns.day}</th>
                    <th className="pb-2 text-right font-normal">{c.rates.columns.week}</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2.5 font-medium">{s.label}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatVnd(s.hourly)}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatVnd(s.daily)}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatVnd(s.weekly)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted-foreground mt-3 text-xs">{c.rates.note}</p>
            </Card>
          </div>

          <div className="lg:sticky lg:top-8">
            <BookingWidget availability={availability} />
          </div>
        </div>

        <FindUsMap copy={c.findUs} />

        <Faq heading={c.faq.heading} items={c.faq.items} />
      </div>
    </main>
  );
}
