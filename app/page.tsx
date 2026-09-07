import { MapPin, Clock, ShieldCheck } from "lucide-react";
import { BookingWidget } from "@/components/booking-widget";
import { Card } from "@/components/ui/card";
import { LOCATION, SIZES } from "@/lib/config";
import { countAvailable } from "@/lib/data/bookings";
import { formatVnd } from "@/lib/money";
import type { LockerSize } from "@/lib/types";

// Availability is read per request from the booking store, so this page must
// not be prerendered at build time (where the store is always empty).
export const dynamic = "force-dynamic";

export default async function Home() {
  // Availability for the next 24h, so sold-out sizes are visible up front.
  // The booking action re-checks authoritatively for the chosen period.
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const availability: Partial<Record<LockerSize, number>> = {};
  for (const size of SIZES) {
    availability[size.id] = await countAvailable(
      size.id,
      now.toISOString(),
      tomorrow.toISOString()
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Drop your bags in Bui Vien. Explore hands-free.
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Secure luggage storage at {LOCATION.name} — by the hour, day, or
              week. Pay only for the time you use.
            </p>

            <div className="mt-6 space-y-3">
              {[
                [MapPin, LOCATION.address],
                [Clock, LOCATION.hours],
                [ShieldCheck, "Sealed, monitored storage. Reference code at pickup."],
              ].map(([Icon, text], i) => {
                const IconComponent = Icon as typeof MapPin;
                return (
                  <p key={i} className="text-muted-foreground flex items-center gap-2.5 text-sm">
                    <IconComponent className="text-brand size-4 shrink-0" />
                    {text as string}
                  </p>
                );
              })}
            </div>

            <Card className="mt-8 p-6">
              <h2 className="font-semibold">Luggage storage price</h2>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="pb-2 font-normal">Type</th>
                    <th className="pb-2 text-right font-normal">Hour</th>
                    <th className="pb-2 text-right font-normal">Day</th>
                    <th className="pb-2 text-right font-normal">Week</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2.5 font-medium">{s.label}</td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatVnd(s.hourly)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatVnd(s.daily)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatVnd(s.weekly)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted-foreground mt-3 text-xs">
                Longer stays are billed at the better rate automatically — a
                9-day stay costs a week plus two days, never nine days.
              </p>
            </Card>
          </div>

          <div className="lg:sticky lg:top-8">
            <BookingWidget availability={availability} />
          </div>
        </div>
      </div>
    </main>
  );
}
