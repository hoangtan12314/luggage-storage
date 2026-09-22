import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FindUsMap } from "@/components/find-us-map";
import { Card } from "@/components/ui/card";
import { copy, landingCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

/**
 * The "/" homestay landing page — introduces both services and hands off to
 * their own booking pages. Deliberately light: no booking widget lives here,
 * only two clear entry points, so a first-time visitor picks a service
 * before being asked any booking questions.
 */
export function LandingPage({ locale }: { locale: Locale }) {
  const c = landingCopy[locale];
  const base = locale === "en" ? "" : "/vi";
  const findUs = copy[locale].findUs;

  const services = [
    { ...c.services.luggage, href: `${base}/luggage` },
    { ...c.services.rooms, href: `${base}/rooms` },
  ];

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center lg:py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {c.hero.h1}
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
          {c.hero.tagline}
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16 lg:pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <Link key={service.href} href={service.href} className="group block">
              <Card className="hover:border-brand h-full p-8 transition-colors">
                <h2 className="text-2xl font-semibold">{service.title}</h2>
                <p className="text-muted-foreground mt-3">{service.blurb}</p>
                <p className="text-brand-ink mt-4 text-sm font-medium">
                  {service.priceFrom}
                </p>
                <p className="text-brand-ink group-hover:text-brand mt-6 flex items-center gap-1.5 text-sm font-semibold">
                  {service.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-muted/30 border-t">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <FindUsMap copy={findUs} />
        </div>
      </div>
    </main>
  );
}
