"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCATION } from "@/lib/config";
import type { HomeCopy } from "@/lib/i18n";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

/**
 * Click-to-load map. Google's iframe pulls in a lot of third-party script and
 * sets cookies, so nothing from Google is requested until the visitor asks
 * for the map. The address details and the "Open in Google Maps" link are
 * plain markup and work with no JS at all.
 */
export function FindUsMap({ copy }: { copy: HomeCopy["findUs"] }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">{copy.heading}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{copy.blurb}</p>

      <div className="mt-4 overflow-hidden rounded-xl border">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="text-brand-ink size-4 shrink-0" />
              {LOCATION.address}
            </p>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              {LOCATION.hours}
            </p>
            <a
              href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <Phone className="size-4 shrink-0" />
              {LOCATION.phone}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!showMap && (
              <Button type="button" variant="outline" onClick={() => setShowMap(true)}>
                {copy.showMap}
              </Button>
            )}
            <a
              href={mapsLinkUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-ink inline-flex items-center gap-1.5 text-sm hover:underline"
            >
              {copy.openInMaps}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {showMap && (
          // Fixed aspect ratio so revealing the map doesn't shift the page.
          <div className="aspect-[16/9] w-full border-t sm:aspect-[21/9]">
            <iframe
              src={mapsEmbedUrl()}
              title={copy.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  );
}
