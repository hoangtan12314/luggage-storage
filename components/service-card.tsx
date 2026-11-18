import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ServiceCardCopy } from "@/lib/i18n";

type ServiceCardProps = {
  href: string;
  icon: LucideIcon;
  image: string;
  copy: ServiceCardCopy;
};

/**
 * One of the three landing service cards. A single component serves both
 * layouts: on mobile it is a compact row (photo left, line icon + text
 * right); from lg up the photo widens, fades into the card, and the icon
 * moves into a round badge on the photo. The whole card is one link.
 */
export function ServiceCard({ href, icon: Icon, image, copy }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group focus-visible:ring-ring relative flex min-h-40 overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/70 to-cream shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)] transition-shadow outline-none hover:shadow-[0_12px_36px_-10px_rgba(90,55,20,0.35)] focus-visible:ring-2 lg:min-h-72"
    >
      <div className="absolute inset-y-0 left-0 w-[42%] lg:w-[58%] lg:[mask-image:linear-gradient(to_right,black_55%,transparent)]">
        <Image
          src={image}
          alt={copy.imageAlt}
          fill
          sizes="(min-width: 1024px) 20vw, 40vw"
          className="object-cover object-[25%_50%] transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <span
        aria-hidden
        className="absolute top-8 left-8 hidden size-[4.5rem] items-center justify-center rounded-full bg-white/90 text-cocoa shadow-sm lg:flex"
      >
        <Icon className="size-8" strokeWidth={1.4} />
      </span>

      <div className="relative ml-[42%] flex flex-1 flex-col justify-center gap-1 py-5 pr-5 pl-5 lg:ml-0 lg:justify-between lg:py-9 lg:pr-5 lg:pl-[46%] xl:pr-6">
        <div>
          <Icon
            aria-hidden
            className="mb-2 size-8 text-cocoa lg:hidden"
            strokeWidth={1.4}
          />
          <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight text-cocoa lg:text-[1.2rem] xl:text-[1.4rem]">
            {copy.title}
          </h3>
          <p className="mt-2 text-sm leading-snug text-cocoa-muted lg:text-base">
            {copy.blurb}
          </p>
        </div>
        <p className="text-brand-ink mt-3 flex items-center gap-1.5 text-sm font-medium lg:mt-6 lg:text-base">
          {copy.cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}
