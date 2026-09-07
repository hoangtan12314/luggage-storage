import Link from "next/link";
import { LOCATION } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden>🧳</span>
          <span>{LOCATION.shortName}</span>
          <span className="text-muted-foreground font-normal">Luggage Storage</span>
        </Link>
        <a
          href={`tel:${LOCATION.phone.replace(/\s/g, "")}`}
          className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline"
        >
          {LOCATION.phone}
        </a>
      </div>
    </header>
  );
}
