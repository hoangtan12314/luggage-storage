import type { FaqItem } from "@/lib/i18n";

/**
 * Plain <details>/<summary> accordion — no client JS needed, and the
 * answers are in the DOM (not hidden behind a client-only toggle), which
 * matters both for accessibility and for crawlers reading the FAQ content.
 */
export function Faq({
  heading,
  items,
  tone = "default",
}: {
  heading: string;
  items: FaqItem[];
  /** "cream" matches the cream/cocoa pages; "default" is the original white style. */
  tone?: "default" | "cream";
}) {
  const cream = tone === "cream";
  return (
    <section className={cream ? "mt-14" : "mt-12"}>
      <h2 className={cream ? "font-display text-2xl font-semibold tracking-tight text-cocoa" : "text-2xl font-semibold"}>
        {heading}
      </h2>
      <div
        className={
          cream
            ? "mt-4 divide-y divide-cocoa/10 overflow-hidden rounded-3xl border border-white/70 bg-white/70 text-cocoa shadow-[0_8px_30px_-12px_rgba(90,55,20,0.25)]"
            : "mt-4 divide-y rounded-xl border"
        }
      >
        {items.map((item) => (
          <details key={item.question} className={cream ? "group px-5 py-4" : "group p-4"}>
            <summary className="focus-visible:ring-ring cursor-pointer list-none rounded font-medium marker:content-none focus-visible:ring-2 focus-visible:outline-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span
                  aria-hidden
                  className={cream ? "text-brand-ink shrink-0 text-xl transition-transform group-open:rotate-45" : "text-muted-foreground shrink-0 transition-transform group-open:rotate-45"}
                >
                  +
                </span>
              </span>
            </summary>
            <p className={cream ? "text-cocoa-muted mt-2 text-sm" : "text-muted-foreground mt-2 text-sm"}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
