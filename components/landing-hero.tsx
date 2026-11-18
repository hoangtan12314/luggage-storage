import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, ChefHat, Luggage } from "lucide-react";
import type { LandingCopy } from "@/lib/i18n";

/**
 * Landing hero. Mobile: photo on top fading into the cream page, text
 * overlapping its lower edge. Desktop (lg+): photo column on the left with
 * an organic curved right edge, text column on the right. The headline is
 * one <h1> with a per-breakpoint span so assistive tech only ever sees the
 * one that is visible.
 */
export function LandingHero({
  copy,
  base,
}: {
  copy: LandingCopy;
  base: string;
}) {
  const { hero, nav } = copy;
  const pills = [
    { href: `${base}/classes`, icon: ChefHat, label: nav.cooking },
    { href: `${base}/rooms`, icon: BedDouble, label: nav.rooms },
    { href: `${base}/luggage`, icon: Luggage, label: nav.luggage },
  ];

  return (
    <section className="lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div className="relative h-[27rem] overflow-hidden sm:h-[30rem] lg:h-[30rem] lg:[border-radius:0_17%_31%_0/0_44%_56%_0]">
        {/* Below lg the photo starts under the floating header (top-[4.5rem])
            so the logo tile and menu button never cover the face; a fade
            hides the seam. From lg up it fills the column. */}
        <div className="absolute inset-x-0 top-[4.5rem] bottom-0 lg:inset-0">
          <Image
            src="/big-cover.jpg"
            alt={hero.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-[35%_30%]"
          />
          <div
            aria-hidden
            className="from-cream absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent lg:hidden"
          />
        </div>
        <div
          aria-hidden
          className="via-cream/70 to-cream absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent lg:hidden"
        />
      </div>

      <div className="relative -mt-12 px-6 pb-10 sm:px-10 lg:mt-0 lg:pl-12 lg:pr-8 lg:py-10">
        <p className="hidden items-center gap-5 text-sm font-medium tracking-[0.3em] text-cocoa lg:flex">
          {hero.eyebrow}
          <span aria-hidden className="h-px w-28 bg-cocoa/50" />
        </p>

        <h1 className="font-display text-[3rem] leading-none font-semibold tracking-tight text-cocoa lg:mt-6 lg:text-[3.5rem] lg:leading-[1.08] xl:text-[4rem]">
          <span className="lg:hidden">{hero.h1Mobile}</span>
          <span className="hidden lg:inline">{hero.h1}</span>
        </h1>

        <p className="mt-4 text-base font-medium tracking-[0.25em] text-cocoa uppercase sm:text-lg lg:hidden">
          {hero.tagline}
        </p>
        <span aria-hidden className="bg-gold mt-5 block h-0.5 w-16 lg:hidden" />

        <p className="mt-5 max-w-sm text-lg leading-snug text-cocoa-muted lg:hidden">
          {hero.descriptionMobile}
        </p>
        <p className="mt-6 hidden max-w-xl text-xl leading-snug text-cocoa lg:block">
          {hero.description}
        </p>

        <div className="mt-8 hidden flex-wrap items-center gap-2.5 xl:gap-3 lg:flex">
          {pills.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="focus-visible:ring-ring flex h-14 items-center gap-2 rounded-full border border-cocoa/40 px-3.5 text-[13px] text-cocoa transition-colors outline-none hover:bg-white/60 focus-visible:ring-2"
            >
              <Icon aria-hidden className="size-5 shrink-0" strokeWidth={1.4} />
              <span className="max-w-[5rem] leading-tight">{label}</span>
            </Link>
          ))}
          <LearnMore href="#services" className="">
            {hero.learnMore}
          </LearnMore>
        </div>

        <LearnMore href="#services" className="mt-8 lg:hidden">
          {hero.exploreCta}
        </LearnMore>
      </div>
    </section>
  );
}

function LearnMore({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`bg-gold focus-visible:ring-ring inline-flex items-center gap-3 rounded-full px-5 py-3 text-[15px] font-medium whitespace-nowrap text-cocoa shadow-sm transition-colors outline-none hover:brightness-95 focus-visible:ring-2 ${className ?? ""}`}
    >
      {children}
      <ArrowRight aria-hidden className="size-5" />
    </Link>
  );
}
