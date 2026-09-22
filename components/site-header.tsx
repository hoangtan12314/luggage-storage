"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LOCATION } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV_LABEL: Record<Locale, { luggage: string; rooms: string }> = {
  en: { luggage: "Luggage", rooms: "Rooms" },
  vi: { luggage: "Gửi Hành Lý", rooms: "Phòng Nghỉ" },
};

/**
 * Top toolbar: brand, then Luggage/Rooms as the two service entry points —
 * these ARE the primary calls to action (each leads straight to that
 * service's own booking widget), so there's no separate "Book now" button
 * competing with them. Active state follows the current path.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const base = locale === "en" ? "" : "/vi";
  const labels = NAV_LABEL[locale];

  const isActive = (path: string) => {
    const full = `${base}${path}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  const linkClass = (active: boolean) =>
    cn(
      "text-sm font-medium transition-colors",
      active ? "text-brand-ink" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href={base || "/"} className="flex items-center gap-2 font-semibold">
          <span aria-hidden>🏠</span>
          <span>{LOCATION.shortName}</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href={`${base}/luggage`} className={linkClass(isActive("/luggage"))}>
            {labels.luggage}
          </Link>
          <Link href={`${base}/rooms`} className={linkClass(isActive("/rooms"))}>
            {labels.rooms}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
            className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline"
          >
            {LOCATION.phone}
          </a>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
