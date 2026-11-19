import { Clock, MapPin, ShieldCheck } from "lucide-react";
import type { HomeCopy } from "@/lib/i18n";

/**
 * Luggage page hero. Desktop: headline, trust points and the price table
 * stack in the left column, with the booking card (`children`) spanning both
 * rows on the right. Mobile: headline, then the card, then the price table
 * (grid order = DOM order). The trust points show from lg up.
 */
export function LuggageHero({
  hero,
  rates,
  children,
}: {
  hero: HomeCopy["hero"];
  /** The price table, shown under the trust points on desktop and after the card on mobile. */
  rates: React.ReactNode;
  children: React.ReactNode;
}) {
  const trustIcons = [ShieldCheck, Clock, MapPin];

  return (
    <section className="relative isolate mx-auto max-w-[1500px] px-4 pt-24 pb-8 sm:px-6 lg:px-14 lg:pt-6 lg:pb-8">
      <div className="lg:grid lg:grid-cols-[1.08fr_1fr] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-6">
        <div className="lg:pt-6">
          <p className="text-sm font-medium tracking-[0.25em] text-cocoa uppercase">
            {hero.eyebrow}
          </p>
          <span aria-hidden className="bg-gold mt-3 block h-0.5 w-14" />

          <h1 className="font-display mt-6 max-w-[9ch] text-[2.125rem] leading-[1.08] font-semibold tracking-tight text-cocoa sm:max-w-none sm:text-5xl lg:max-w-none lg:text-[3.5rem] xl:text-[4rem]">
            {hero.h1}
          </h1>
          <p className="mt-4 max-w-[13rem] text-base leading-snug text-cocoa sm:max-w-sm sm:text-lg lg:mt-6 lg:max-w-md lg:text-xl">
            {hero.subhead}
          </p>

          <ul className="mt-8 hidden gap-8 lg:flex">
            {hero.trust.map((label, i) => {
              const Icon = trustIcons[i];
              return (
                <li key={label} className="flex flex-col items-center gap-2 text-center text-sm text-cocoa">
                  <span className="bg-gold/35 flex size-14 items-center justify-center rounded-full">
                    <Icon aria-hidden className="size-6" strokeWidth={1.5} />
                  </span>
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">{children}</div>

        <div className="mt-8 lg:col-start-1 lg:row-start-2 lg:mt-0">{rates}</div>
      </div>
    </section>
  );
}
