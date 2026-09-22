"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCATION } from "@/lib/config";
import { localizedPath } from "@/lib/i18n-routes";
import type { Locale } from "@/lib/i18n";

const LABEL: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
const LOCALES: Locale[] = ["en", "vi"];

export function SiteFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <footer className="mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-6 py-8 text-sm">
        <div>
          <p className="text-foreground font-medium">{LOCATION.name}</p>
          <p>{LOCATION.address}</p>
          <p>
            {LOCATION.hours} · {LOCATION.phone}
          </p>
        </div>

        {/* Real anchors for both languages. The header dropdown renders its
            links inside a Radix portal that only mounts when opened, so these
            are the crawlable / <-> /vi links in the page body. Each points at
            the current page's counterpart, not always the site root — see
            lib/i18n-routes.ts. */}
        <nav className="flex items-center gap-3" aria-label="Language">
          {LOCALES.map((target) => (
            <Link
              key={target}
              href={localizedPath(pathname, target)}
              hrefLang={target}
              lang={target}
              aria-current={target === locale ? "true" : undefined}
              className={
                target === locale
                  ? "text-foreground font-medium"
                  : "hover:text-foreground underline-offset-4 hover:underline"
              }
            >
              {LABEL[target]}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
