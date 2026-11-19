"use client";

import { useState } from "react";
import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { LOCATION } from "@/lib/config";
import type { HomeCopy } from "@/lib/i18n";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

/**
 * Address / hours / phone strip under the luggage hero, with a map tile that
 * loads Google's embed only when asked (the iframe pulls in third-party script
 * and cookies). Address, phone and the "Open in Google Maps" link are plain
 * markup and work without JS.
 */
export function LuggageInfoBar({ copy }: { copy: HomeCopy["findUs"] }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <section
      aria-label={copy.heading}
      className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-14"
    >
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 text-cocoa shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:gap-0 lg:p-0">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_1fr] lg:gap-0">
            <p className="flex items-start gap-3 text-sm leading-snug lg:px-8 lg:py-6 lg:text-base">
              <MapPin aria-hidden className="text-brand-ink mt-0.5 size-6 shrink-0" strokeWidth={1.5} />
              {LOCATION.address}
            </p>
            <p className="flex items-center gap-3 text-sm lg:border-l lg:border-cocoa/15 lg:px-8 lg:py-6 lg:text-base">
              <Clock aria-hidden className="text-brand-ink size-6 shrink-0" strokeWidth={1.5} />
              {LOCATION.hours}
            </p>
            <a
              href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
              className="hover:text-brand-ink flex min-h-11 items-center gap-3 text-sm sm:col-span-2 lg:col-span-1 lg:border-l lg:border-cocoa/15 lg:px-8 lg:py-6 lg:text-base"
            >
              <Phone aria-hidden className="text-brand-ink size-6 shrink-0" strokeWidth={1.5} />
              {LOCATION.phone}
            </a>
          </div>

          <div className="flex items-center gap-4 lg:pr-4">
            <a
              href={mapsLinkUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-cocoa/25 bg-white/80 px-5 text-sm whitespace-nowrap transition-colors outline-none hover:bg-white focus-visible:ring-2"
            >
              {copy.openInMaps}
              <ExternalLink aria-hidden className="size-4" />
            </a>
            {!showMap && (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="focus-visible:ring-ring from-gold/40 to-cream-2 relative flex h-16 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-xs font-medium outline-none focus-visible:ring-2 lg:h-[4.5rem] lg:w-40"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(90,55,20,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(90,55,20,0.25)_1px,transparent_1px)] [background-size:18px_18px]"
                />
                <span className="relative flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 whitespace-nowrap">
                  <MapPin aria-hidden className="size-3.5 text-red-600" />
                  {copy.showMap}
                </span>
              </button>
            )}
          </div>
        </div>

        {showMap && (
          // Fixed aspect ratio so revealing the map doesn't shift the page.
          <div className="aspect-[16/9] w-full border-t border-cocoa/10 sm:aspect-[21/9]">
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
