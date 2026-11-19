import { ExternalLink, MapPin } from "lucide-react";
import { mapsSearchUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";

/**
 * Where a class meets. Deliberately not the homestay in LOCATION — classes
 * meet on Bùi Viện — so this takes the class's own address. Links out to
 * Google Maps (no embedded map: nothing to load until the guest asks).
 */
export function MeetingPoint({
  address,
  label,
  details,
  openInMaps,
  className,
}: {
  address: string;
  /** Campus name ("Campus 1") shown above the address. */
  label?: string;
  details?: string;
  openInMaps: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/60 p-5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <MapPin aria-hidden className="text-brand-ink mt-0.5 size-5 shrink-0" />
        <div>
          {label && (
            <span className="bg-gold/25 mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide text-cocoa uppercase">
              {label}
            </span>
          )}
          <p className="font-medium text-cocoa">{address}</p>
          {details && <p className="text-cocoa-muted mt-1 text-sm">{details}</p>}
        </div>
      </div>
      <a
        href={mapsSearchUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-ink focus-visible:ring-ring inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-1 text-sm font-medium outline-none hover:underline focus-visible:ring-2"
      >
        {openInMaps}
        <ExternalLink aria-hidden className="size-4" />
      </a>
    </div>
  );
}
