import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClassCover } from "@/components/class-cover";
import type { ClassType } from "@/lib/config";
import type { ClassesCopy } from "@/lib/i18n";
import { formatVnd } from "@/lib/money";

type ClassTypeCardProps = {
  type: ClassType;
  /** The type's first highlight, already in the page's language. */
  highlight: string;
  copy: ClassesCopy["list"];
  href: string;
};

/**
 * One class type on the /classes list. Same visual language as the landing
 * ServiceCard — photo on the left fading into a cream card — and the whole
 * card is one link to the type's page.
 */
export function ClassTypeCard({ type, highlight, copy, href }: ClassTypeCardProps) {
  const options =
    type.options.length === 1
      ? copy.optionsOne
      : copy.optionsMany.replace("{n}", String(type.options.length));

  return (
    <Link
      href={href}
      className="group focus-visible:ring-ring relative flex min-h-72 overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/70 to-cream shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)] transition-shadow duration-200 outline-none hover:shadow-[0_12px_36px_-10px_rgba(90,55,20,0.35)] focus-visible:ring-2"
    >
      <div className="absolute inset-y-0 left-0 w-[38%] sm:w-[34%] lg:w-[40%] lg:[mask-image:linear-gradient(to_right,black_60%,transparent)]">
        <ClassCover
          slug={type.slug}
          image={type.poster}
          alt=""
          sizes="(min-width: 1024px) 18vw, 38vw"
          className="object-[0%_40%] transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>

      <div className="relative ml-[38%] flex flex-1 flex-col gap-3 p-5 sm:ml-[34%] lg:ml-[40%] lg:p-6">
        <h3 className="font-display text-xl leading-snug font-semibold tracking-tight text-cocoa lg:text-2xl">
          {type.title}
        </h3>
        <p className="text-brand-ink text-lg leading-tight font-semibold">
          <span className="text-cocoa-muted block text-xs font-normal">{copy.from}</span>
          {formatVnd(type.fromPrice)}
          <span className="text-cocoa-muted ml-1.5 text-sm font-normal whitespace-nowrap">
            {copy.perPerson}
          </span>
        </p>
        <p className="text-cocoa-muted text-xs font-medium tracking-wide uppercase">{options}</p>
        <p className="text-cocoa-muted line-clamp-3 text-sm leading-relaxed">{highlight}</p>
        <p className="text-brand-ink mt-auto flex items-center gap-1.5 text-sm font-semibold">
          {copy.viewDetails}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </p>
      </div>
    </Link>
  );
}
