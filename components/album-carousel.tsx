"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AlbumPhoto } from "@/lib/albums";

/** Time each photo stays before the album slides on by itself. */
const AUTOPLAY_MS = 4000;

type AlbumCarouselProps = {
  photos: AlbumPhoto[];
  copy: {
    label: string;
    previous: string;
    next: string;
    /** "Open photo {n} of {total}" */
    open: string;
  };
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * A class's photo album, one photo at a time in a fixed frame (so the page
 * never jumps between slides). Wide photos fill the frame; portrait ones are
 * shown whole over a blurred copy of themselves. Slides on its own every 4 s
 * (not for guests who prefer reduced motion), pausing while the pointer or
 * keyboard focus is inside, and tapping a photo opens it full-screen in a
 * lightbox.
 */
export function AlbumCarousel({ photos, copy }: AlbumCarouselProps) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: photos.length > 1,
  });
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  // Paused while the pointer or keyboard focus is inside, or the lightbox is open.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const autoplay = photos.length > 1 && !reducedMotion && !hovered && !focused && lightboxIndex < 0;
  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    const id = window.setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, autoplay]);

  const many = photos.length > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={copy.label}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-3xl">
        <div className="flex">
          {photos.map((photo, i) => {
            // Wide photos fill the frame; narrower (e.g. portrait) ones are shown whole
            // over a blurred copy of themselves instead of being cropped.
            const wide = photo.width / photo.height >= 1.3;
            return (
              <button
                key={photo.src}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={copy.open.replace("{n}", String(i + 1)).replace("{total}", String(photos.length))}
                className="focus-visible:ring-ring relative aspect-[4/3] min-w-0 flex-[0_0_100%] cursor-zoom-in overflow-hidden outline-none focus-visible:ring-2 sm:aspect-[16/10]"
              >
                {!wide && (
                  <Image
                    src={photo.src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="200px"
                    className="scale-125 object-cover blur-2xl"
                  />
                )}
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1200px) 740px, (min-width: 1024px) 60vw, 100vw"
                  className={wide ? "object-cover" : "object-contain"}
                />
              </button>
            );
          })}
        </div>
      </div>

      {many && (
        <>
          <span
            aria-hidden
            className="text-cocoa pointer-events-none absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm"
          >
            {current + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={copy.previous}
            className="text-cocoa focus-visible:ring-ring absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white focus-visible:ring-2 outline-none"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={copy.next}
            className="text-cocoa focus-visible:ring-ring absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white focus-visible:ring-2 outline-none"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        index={Math.max(lightboxIndex, 0)}
        close={() => setLightboxIndex(-1)}
        slides={photos.map((p) => ({ src: p.src, width: p.width, height: p.height, alt: p.alt }))}
        carousel={{ finite: !many }}
        render={many ? undefined : { buttonPrev: () => null, buttonNext: () => null }}
        styles={{ container: { backgroundColor: "rgba(40, 24, 12, 0.92)" } }}
      />
    </section>
  );
}
