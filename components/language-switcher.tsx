"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localizedPath } from "@/lib/i18n-routes";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LABEL: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
const LOCALES: Locale[] = ["en", "vi"];

/**
 * Language dropdown. The menu items are real <Link>s (via `asChild`) rather
 * than router.push handlers — those anchors are the only / <-> /vi links in
 * the page body, they back up the hreflang tags in <head>, and they keep
 * language switching working for keyboard/screen-reader users. Each link
 * points at the current page's counterpart (see lib/i18n-routes.ts), not
 * always the site root.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1.5 rounded-md text-sm focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Change language"
      >
        <Globe className="size-4" />
        <span>{LABEL[locale]}</span>
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {LOCALES.map((target) => (
          <DropdownMenuItem key={target} asChild>
            <Link
              href={localizedPath(pathname, target)}
              hrefLang={target}
              lang={target}
              aria-current={target === locale ? "true" : undefined}
              className="flex cursor-pointer items-center justify-between gap-2"
            >
              {LABEL[target]}
              <Check
                className={cn("size-4", target === locale ? "opacity-100" : "opacity-0")}
              />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
