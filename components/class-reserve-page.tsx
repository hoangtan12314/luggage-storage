import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClassReserveForm } from "@/components/class-reserve-form";
import { getWorkshop } from "@/lib/config";
import { countSeatsAvailable } from "@/lib/data/bookings";
import { classesCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { quoteClass } from "@/lib/pricing";
import { classSelectionSchema } from "@/lib/validation";

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The reservation form page, reached from "Select" on a class page. The
 * selection travels in the query string, which is untrusted: it is re-parsed
 * with the same schema the server action uses, and the seats are re-checked,
 * so a stale or tampered link lands on a "choose again" message instead of a
 * form that cannot succeed.
 */
export async function ClassReservePage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: SearchParams;
}) {
  const c = classesCopy[locale];
  const base = locale === "en" ? "" : "/vi";

  const parsed = classSelectionSchema.safeParse({
    workshopId: first(searchParams.workshop),
    date: first(searchParams.date),
    time: first(searchParams.time),
    people: first(searchParams.people),
  });
  const workshop = parsed.success ? getWorkshop(parsed.data.workshopId) : undefined;

  if (!parsed.success || !workshop) {
    return (
      <Shell>
        <Notice
          title={c.reserve.invalid.title}
          body={c.reserve.invalid.body}
          cta={c.reserve.invalid.cta}
          href={`${base}/classes`}
        />
      </Shell>
    );
  }

  const { date, time, people } = parsed.data;
  const changeHref = `${base}/classes/${workshop.icon}`;

  const seatsLeft = await countSeatsAvailable(workshop.icon, date, time);
  if (seatsLeft < people) {
    return (
      <Shell>
        <Notice
          title={c.reserve.invalid.title}
          body={c.reserve.noSeats.replace("{n}", String(seatsLeft))}
          cta={c.reserve.invalid.cta}
          href={changeHref}
        />
      </Shell>
    );
  }

  const priced = quoteClass(workshop, date, time, people);
  const dateLabel = new Date(`${date}T00:00:00Z`).toLocaleDateString(
    locale === "vi" ? "vi-VN" : "en-US",
    { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
  );

  return (
    <Shell>
      <Link
        href={changeHref}
        className="text-cocoa-muted hover:text-cocoa inline-flex min-h-11 items-center gap-1.5 text-sm underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {workshop.name}
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-cocoa lg:text-4xl">
        {c.reserve.heading}
      </h1>
      <p className="text-cocoa-muted mt-2 mb-8 text-lg">{c.reserve.blurb}</p>

      <ClassReserveForm
        copy={c.reserve}
        openInMaps={c.detail.openInMaps}
        selection={{ workshopId: workshop.id, date, time, people }}
        summary={{
          className: workshop.name,
          dateLabel,
          pricePerPerson: workshop.pricePerPerson,
          total: priced.total,
          meetingAddress: workshop.meetingPoint.address,
          meetingDetails: workshop.meetingPoint.details,
          changeHref,
        }}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="from-cream to-cream-2 flex-1 bg-gradient-to-b">
      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10 lg:pb-20">
        {children}
      </div>
    </main>
  );
}

function Notice({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/70 bg-white/60 p-8 text-center shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-cocoa">{title}</h1>
      <p className="text-cocoa-muted mt-3">{body}</p>
      <Link
        href={href}
        className="bg-gold focus-visible:ring-ring mt-6 inline-flex min-h-12 items-center rounded-full px-6 text-[15px] font-medium text-cocoa shadow-sm transition-[filter] duration-200 outline-none hover:brightness-95 focus-visible:ring-2"
      >
        {cta}
      </Link>
    </div>
  );
}
