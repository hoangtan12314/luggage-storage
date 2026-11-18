import Image from "next/image";
import { Coffee, Cookie, Soup } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClassTypeSlug } from "@/lib/config";
import { cn } from "@/lib/utils";

const ICONS: Record<ClassTypeSlug, LucideIcon> = {
  coffee: Coffee,
  cocoa: Cookie,
  "spring-roll": Soup,
};

type ClassCoverProps = {
  slug: ClassTypeSlug;
  /** Cover photo under /public. Omitted → a cream icon panel, never another class's photo. */
  image?: string;
  /** Empty string for a decorative image next to its title. */
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Size of the icon medallion shown when there is no photo. */
  iconClassName?: string;
  className?: string;
};

/**
 * A class's cover: its photo when it has one, otherwise a warm icon panel.
 * Fills its (relatively positioned) parent.
 */
export function ClassCover({
  slug,
  image,
  alt,
  sizes,
  priority,
  iconClassName,
  className,
}: ClassCoverProps) {
  const Icon = ICONS[slug];

  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="from-gold/35 via-gold/15 to-cream flex size-full items-center justify-center bg-gradient-to-br"
    >
      <span
        className={cn(
          "flex size-20 items-center justify-center rounded-full bg-white/85 text-cocoa shadow-sm",
          iconClassName
        )}
      >
        <Icon className="size-1/2" strokeWidth={1.4} />
      </span>
    </div>
  );
}
