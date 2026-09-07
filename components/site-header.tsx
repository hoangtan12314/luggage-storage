import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LOCATION } from "@/lib/config";
import type { Locale } from "@/lib/i18n";

const TAGLINE: Record<Locale, string> = {
  en: "Luggage Storage",
  vi: "Lưu Trữ Hành Lý",
};

export function SiteHeader({ locale }: { locale: Locale }) {
  const homeHref = locale === "en" ? "/" : "/vi";

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold">
          <span aria-hidden>🧳</span>
          <span>{LOCATION.shortName}</span>
          <span className="text-muted-foreground font-normal">{TAGLINE[locale]}</span>
        </Link>
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
