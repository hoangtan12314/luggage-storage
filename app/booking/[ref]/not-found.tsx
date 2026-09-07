import Link from "next/link";

export default function BookingNotFound() {
  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          We couldn&apos;t find that booking
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Double-check your reference code, or book a new locker.
        </p>
        <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
