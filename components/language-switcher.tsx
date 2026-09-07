"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGES: { locale: Locale; label: string; href: string }[] = [
  { locale: "en", label: "English", href: "/" },
  { locale: "vi", label: "Tiếng Việt", href: "/vi" },
];

/**
 * Language dropdown. The menu items are real <Link>s (via `asChild`) rather
 * than router.push handlers — those anchors are the only / <-> /vi links in
 * the page body, they back up the hreflang tags in <head>, and they keep
 * language switching working for keyboard/screen-reader users.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const current = LANGUAGES.find((l) => l.locale === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1.5 rounded-md text-sm focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Change language"
      >
        <Globe className="size-4" />
        <span>{current.label}</span>
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem key={language.locale} asChild>
            <Link
              href={language.href}
              hrefLang={language.locale}
              lang={language.locale}
              aria-current={language.locale === locale ? "true" : undefined}
              className="flex cursor-pointer items-center justify-between gap-2"
            >
              {language.label}
              <Check
                className={cn(
                  "size-4",
                  language.locale === locale ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
