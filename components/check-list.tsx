import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A list of short facts with a leading check (included, highlights) or cross
 * (not included). The icons are decorative: the list semantics and the text
 * carry the meaning, so they are hidden from assistive tech.
 */
export function CheckList({
  items,
  variant = "check",
  className,
}: {
  items: string[];
  variant?: "check" | "cross";
  className?: string;
}) {
  const Icon = variant === "check" ? Check : X;
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 leading-relaxed text-cocoa">
          <Icon
            aria-hidden
            className={cn(
              "mt-1 size-4 shrink-0",
              variant === "check" ? "text-brand-ink" : "text-cocoa-muted"
            )}
            strokeWidth={2.2}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
