"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  CAMPUSES,
  ESTABLISHED_YEAR,
  LOCATION,
  SOCIAL_LINKS,
  VIETNAMESE_ENABLED,
} from "@/lib/config";
import { landingCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n-routes";

const LABEL: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
const LOCALES: Locale[] = ["en", "vi"];

const subscribeNever = () => () => {};

/**
 * The visitor's current year on the client. Statically generated pages would
 * otherwise freeze the year they were built in; the server snapshot is the
 * build year so hydration never mismatches.
 */
function useCurrentYear(): number {
  return useSyncExternalStore(
    subscribeNever,
    () => new Date().getFullYear(),
    () => new Date().getFullYear()
  );
}

/**
 * Site footer, in the same cream / cocoa / gold language as the header and
 * the landing page: brand + contact, the two campuses, where else to find us,
 * and the copyright line.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const year = useCurrentYear();
  const c = landingCopy[locale].footer;

  // A link with no URL yet is simply not shown.
  const social = SOCIAL_LINKS.filter((link) => link.url);
  const range = year > ESTABLISHED_YEAR ? `${ESTABLISHED_YEAR}–${year}` : `${ESTABLISHED_YEAR}`;

  return (
    <footer className="from-cream to-cream-2 mt-auto border-t border-cocoa/10 bg-gradient-to-b text-cocoa-muted">
      <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr_1fr]">
          {/* Brand + contact */}
          <div>
            <Link href={locale === "en" ? "/" : "/vi"} className="inline-block">
              <Image
                src="/logo.png"
                alt={LOCATION.shortName}
                width={1276}
                height={546}
                className="h-14 w-auto rounded-xl shadow-md"
              />
            </Link>
            <p className="font-display mt-4 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-cocoa">
              {LOCATION.name}
              <span className="bg-gold/25 rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold tracking-wide text-cocoa uppercase">
                {c.since.replace("{year}", String(ESTABLISHED_YEAR))}
              </span>
            </p>
            <p className="mt-2 text-sm">
              {LOCATION.hours} ·{" "}
              <a
                href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
                className="text-cocoa underline-offset-4 hover:underline"
              >
                {LOCATION.phone}
              </a>
            </p>
          </div>

          {/* Campuses */}
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-cocoa">
              {c.campuses}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {CAMPUSES.map((campus) => (
                <li
                  key={campus.id}
                  className="rounded-2xl border border-white/70 bg-white/60 p-4 text-sm"
                >
                  <span className="bg-gold/25 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide text-cocoa uppercase">
                    {campus.name}
                  </span>
                  <p className="mt-2 leading-relaxed text-cocoa">{campus.address[locale]}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Elsewhere */}
          {social.length > 0 && (
            <nav aria-label={c.follow}>
              <h2 className="font-display text-lg font-semibold tracking-tight text-cocoa">
                {c.follow}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {social.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} (${c.opensNewTab})`}
                      className="focus-visible:ring-ring inline-flex min-h-11 items-center gap-1.5 rounded-full border border-cocoa/40 px-5 text-sm text-cocoa transition-colors duration-200 outline-none hover:bg-white/60 focus-visible:ring-2"
                    >
                      {link.label}
                      <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-cocoa/10 pt-6 text-xs">
          <p>
            © {range} {LOCATION.shortName}. {c.rights}
          </p>

          {/* Real anchors for both languages, hidden while Vietnamese is
              switched off (VIETNAMESE_ENABLED). Each points at the current
              page's counterpart — see lib/i18n-routes.ts. */}
          {VIETNAMESE_ENABLED && (
            <nav className="flex items-center gap-3 text-sm" aria-label="Language">
              {LOCALES.map((target) => (
                <Link
                  key={target}
                  href={localizedPath(pathname, target)}
                  hrefLang={target}
                  lang={target}
                  aria-current={target === locale ? "true" : undefined}
                  className={
                    target === locale
                      ? "font-medium text-cocoa"
                      : "underline-offset-4 hover:text-cocoa hover:underline"
                  }
                >
                  {LABEL[target]}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
