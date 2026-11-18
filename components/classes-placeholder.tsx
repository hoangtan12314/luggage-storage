import { Phone } from "lucide-react";
import { LOCATION } from "@/lib/config";
import { classesCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

/** Stand-in for the cooking-classes page until online booking exists. */
export function ClassesPlaceholder({ locale }: { locale: Locale }) {
  const c = classesCopy[locale];
  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-cocoa">{c.h1}</h1>
        <p className="mt-6 text-lg text-cocoa-muted">{c.body}</p>
        <a
          href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
          className="bg-gold mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium text-cocoa shadow-sm hover:brightness-95"
        >
          <Phone aria-hidden className="size-5" />
          {c.cta} · {LOCATION.phone}
        </a>
      </div>
    </main>
  );
}
