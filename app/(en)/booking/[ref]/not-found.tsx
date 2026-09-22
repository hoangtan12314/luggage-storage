import Link from "next/link";

export default function BookingNotFound() {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          We couldn&apos;t find that booking
        </h1>
        <p className="mt-2 text-muted-foreground">
          Double-check your reference code, or book a new locker or room.
        </p>
        <Link href="/" className="mt-6 inline-block text-brand-ink hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
