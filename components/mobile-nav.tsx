"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Check, Menu, Phone, X } from "lucide-react";
import { VIETNAMESE_ENABLED } from "@/lib/config";
import { localizedPath } from "@/lib/i18n-routes";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGE_LABEL: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
const LOCALES: Locale[] = ["en", "vi"];

type MobileNavProps = {
  locale: Locale;
  links: { href: string; label: string }[];
  bookNow: { href: string; label: string };
  phone: string;
  openLabel: string;
  closeLabel: string;
};

/**
 * Hamburger menu shown below lg. A Radix Dialog gives us the focus trap,
 * Esc-to-close and scroll lock for free; every link closes it so the panel
 * never lingers over the page you just navigated to.
 */
export function MobileNav({
  locale,
  links,
  bookNow,
  phone,
  openLabel,
  closeLabel,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={openLabel}
        className="focus-visible:ring-ring flex size-11 items-center justify-center rounded-full bg-cream/85 text-cocoa shadow-sm backdrop-blur outline-none focus-visible:ring-2 lg:hidden"
      >
        <Menu className="size-6" strokeWidth={1.6} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-cocoa/30" />
        <Dialog.Content
          aria-describedby={undefined}
          className="bg-cream fixed inset-x-0 top-0 z-50 rounded-b-3xl p-6 pb-8 shadow-2xl outline-none"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-2xl font-semibold tracking-tight text-cocoa">
              Ngõ Saigon
            </Dialog.Title>
            <Dialog.Close
              aria-label={closeLabel}
              className="focus-visible:ring-ring flex size-11 items-center justify-center rounded-full text-cocoa outline-none focus-visible:ring-2"
            >
              <X className="size-6" strokeWidth={1.6} />
            </Dialog.Close>
          </div>

          <nav className="mt-4 flex flex-col">
            {links.map((link) => (
              <Dialog.Close asChild key={link.href}>
                <Link
                  href={link.href}
                  className="border-b border-cocoa/10 py-3.5 text-xl font-medium text-cocoa"
                >
                  {link.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>

          <Dialog.Close asChild>
            <Link
              href={bookNow.href}
              className="bg-gold mt-6 flex items-center justify-center rounded-full px-6 py-3.5 text-base font-medium text-cocoa"
            >
              {bookNow.label}
            </Link>
          </Dialog.Close>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm text-cocoa">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2"
            >
              <Phone className="size-4" />
              {phone}
            </a>
            {VIETNAMESE_ENABLED && (
              <div className="flex items-center gap-4">
                {LOCALES.map((target) => (
                  <Dialog.Close asChild key={target}>
                    <Link
                      href={localizedPath(pathname, target)}
                      hrefLang={target}
                      lang={target}
                      aria-current={target === locale ? "true" : undefined}
                      className={cn(
                        "flex items-center gap-1",
                        target === locale ? "font-semibold" : "text-cocoa-muted"
                      )}
                    >
                      {target === locale && <Check className="size-3.5" />}
                      {LANGUAGE_LABEL[target]}
                    </Link>
                  </Dialog.Close>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
