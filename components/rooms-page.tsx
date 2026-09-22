import { BedDouble, Check } from "lucide-react";
import { Faq } from "@/components/faq";
import { FindUsMap } from "@/components/find-us-map";
import { RoomWidget } from "@/components/room-widget";
import { Card } from "@/components/ui/card";
import { ROOM } from "@/lib/config";
import { roomsCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { formatVnd } from "@/lib/money";
import { buildLodgingJsonLd, buildRoomsFaqJsonLd, jsonLdScript } from "@/lib/seo";

type RoomsPageProps = {
  locale: Locale;
  availability: number;
};

/**
 * The "/rooms" page — same visual language as the luggage page
 * (components/home-page.tsx): hero + facts on the left, live booking widget
 * on the right, FAQ and map below. One room type, so no size cards — the
 * widget is just dates + a quantity stepper.
 */
export function RoomsPage({ locale, availability }: RoomsPageProps) {
  const c = roomsCopy[locale];

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildLodgingJsonLd(locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildRoomsFaqJsonLd(locale)) }}
      />

      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              {c.hero.h1}
            </h1>
            <p className="text-foreground mt-3 text-xl font-medium">{c.hero.subhead}</p>
            <p className="text-muted-foreground mt-4 text-lg">{c.hero.tagline}</p>

            <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
              {c.intro}
            </p>

            <div className="mt-6">
              <h2 className="text-sm font-semibold">{c.amenitiesHeading}</h2>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {c.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                  >
                    <Check className="text-brand size-4 shrink-0" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>

            <Card className="mt-8 p-6">
              <div className="flex items-center gap-3">
                <BedDouble className="text-brand size-5 shrink-0" />
                <h2 className="font-semibold">{c.rateHeading}</h2>
              </div>
              <p className="mt-4 text-2xl font-semibold">
                {formatVnd(ROOM.nightly)}
                <span className="text-muted-foreground text-sm font-normal"> / night</span>
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{ROOM.capacity}</p>
              <p className="text-muted-foreground mt-3 text-xs">{c.rateNote}</p>
            </Card>
          </div>

          <div className="lg:sticky lg:top-8">
            <RoomWidget availability={availability} />
          </div>
        </div>

        <FindUsMap copy={c.findUs} />

        <Faq heading={c.faq.heading} items={c.faq.items} />
      </div>
    </main>
  );
}
