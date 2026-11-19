"use client";

import { useState } from "react";
import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CAMPUS_2, CAMPUSES, LOCATION } from "@/lib/config";
import type { CampusId } from "@/lib/config";
import type { HomeCopy, LandingCopy, Locale } from "@/lib/i18n";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

/**
 * "Find us" for a shop with two campuses: one card per campus, each with its
 * own address, an "Open in Google Maps" link and a click-to-load map.
 *
 * As in FindUsMap, nothing from Google is requested until the visitor asks
 * for a map (the iframe pulls in third-party script and sets cookies); the
 * addresses and links are plain markup. Both campuses share the shop's phone
 * and opening hours (LOCATION).
 */
export function CampusesMap({
  copy,
  notes,
  locale,
}: {
  copy: HomeCopy["findUs"];
  notes: LandingCopy["campuses"]["notes"];
  locale: Locale;
}) {
  const [shown, setShown] = useState<Partial<Record<CampusId, boolean>>>({});

  return (
    <section>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-cocoa">
        {copy.heading}
      </h2>
      <p className="text-cocoa-muted mt-2 text-sm">{copy.blurb}</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {CAMPUSES.map((campus) => {
          // Campus 2 is the homestay, so it keeps using the shop's exact map
          // query (coordinates once MAP.coords is filled in).
          // Google finds Vietnamese addresses most reliably, so the map query
          // uses that form whatever language the page is in.
          const mapAddress = campus.id === CAMPUS_2.id ? undefined : campus.address.vi;
          return (
            <div
              key={campus.id}
              className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]"
            >
              <div className="space-y-3 p-5">
                <div>
                  <span className="bg-gold/25 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide text-cocoa uppercase">
                    {campus.name}
                  </span>
                  <p className="text-cocoa-muted mt-1.5 text-sm">{notes[campus.id]}</p>
                </div>

                <div className="space-y-1.5 text-sm">
                  <p className="flex items-start gap-2 font-medium text-cocoa">
                    <MapPin aria-hidden className="text-brand-ink mt-0.5 size-4 shrink-0" />
                    {campus.address[locale]}
                  </p>
                  <p className="text-cocoa-muted flex items-center gap-2">
                    <Clock aria-hidden className="size-4 shrink-0" />
                    {LOCATION.hours}
                  </p>
                  <a
                    href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
                    className="text-cocoa-muted flex items-center gap-2 hover:text-cocoa"
                  >
                    <Phone aria-hidden className="size-4 shrink-0" />
                    {LOCATION.phone}
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!shown[campus.id] && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShown((s) => ({ ...s, [campus.id]: true }))}
                      className="min-h-11 cursor-pointer rounded-full border-cocoa/25 bg-white/80 px-5 text-cocoa"
                    >
                      {copy.showMap}
                    </Button>
                  )}
                  <a
                    href={mapsLinkUrl(mapAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-ink inline-flex min-h-11 items-center gap-1.5 text-sm font-medium hover:underline"
                  >
                    {copy.openInMaps}
                    <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                </div>
              </div>

              {shown[campus.id] && (
                // Fixed aspect ratio so revealing the map doesn't shift the page.
                <div className="aspect-[16/10] w-full border-t border-cocoa/10">
                  <iframe
                    src={mapsEmbedUrl(mapAddress)}
                    title={`${campus.name}: ${copy.mapTitle}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="size-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
