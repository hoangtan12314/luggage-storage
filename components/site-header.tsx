"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { LOCATION } from "@/lib/config";
import { landingCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Site header. Below lg: logo tile + hamburger. From lg up: serif wordmark,
 * the three service links, phone, language menu and a "Book now" button that
 * jumps to the landing page's service cards (there is no single booking
 * flow — luggage, rooms and classes each have their own).
 *
 * On the landing and classes pages (/, /vi, /classes, /vi/classes) the mobile header floats over the hero
 * photo and the desktop header takes the cream page colour; everywhere else
 * it is a plain white bar.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const base = locale === "en" ? "" : "/vi";
  const nav = landingCopy[locale].nav;
  // Pages that open with a hero photo on the cream surface.
  const isHome =
    pathname === "/" ||
    pathname === "/vi" ||
    pathname === "/classes" ||
    pathname === "/vi/classes";

  const links = [
    { href: `${base}/classes`, label: nav.cooking },
    { href: `${base}/rooms`, label: nav.rooms },
    { href: `${base}/luggage`, label: nav.luggage },
  ];
  const bookNow = {
    href: locale === "en" ? "/#services" : "/vi#services",
    label: nav.bookNow,
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        isHome
          ? "absolute inset-x-0 top-0 z-30 lg:static lg:border-b lg:border-cocoa/10 lg:bg-cream"
          : "border-b bg-white"
      )}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-14 lg:py-5">
        <Link href={base || "/"} className="shrink-0">
          <Image
            src="/logo.png"
            alt={LOCATION.shortName}
            width={1276}
            height={546}
            priority
            className="h-14 w-auto rounded-xl shadow-md lg:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-10 xl:gap-14 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "text-base font-medium text-cocoa underline-offset-8 transition-colors hover:text-brand-ink",
                isActive(link.href) && "underline decoration-gold decoration-2"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 text-sm text-cocoa hover:text-brand-ink xl:flex"
          >
            <Phone aria-hidden className="size-4 text-brand-ink" />
            {LOCATION.phone}
          </a>
          <LanguageSwitcher locale={locale} />
          <Link
            href={bookNow.href}
            className="bg-gold focus-visible:ring-ring rounded-full px-6 py-2.5 text-base font-medium text-cocoa shadow-sm transition-colors outline-none hover:brightness-95 focus-visible:ring-2"
          >
            {bookNow.label}
          </Link>
        </div>

        <MobileNav
          locale={locale}
          links={links}
          bookNow={bookNow}
          phone={LOCATION.phone}
          openLabel={nav.openMenu}
          closeLabel={nav.closeMenu}
        />
      </div>
    </header>
  );
}
