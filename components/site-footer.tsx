import Link from "next/link";
import { LOCATION } from "@/lib/config";
import type { Locale } from "@/lib/i18n";

const LANGUAGES: { locale: Locale; label: string; href: string }[] = [
  { locale: "en", label: "English", href: "/" },
  { locale: "vi", label: "Tiếng Việt", href: "/vi" },
];

export function SiteFooter({ locale }: { locale: Locale }) {
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
            are the crawlable / <-> /vi links in the page body. */}
        <nav className="flex items-center gap-3" aria-label="Language">
          {LANGUAGES.map((language) => (
            <Link
              key={language.locale}
              href={language.href}
              hrefLang={language.locale}
              lang={language.locale}
              aria-current={language.locale === locale ? "true" : undefined}
              className={
                language.locale === locale
                  ? "text-foreground font-medium"
                  : "hover:text-foreground underline-offset-4 hover:underline"
              }
            >
              {language.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
