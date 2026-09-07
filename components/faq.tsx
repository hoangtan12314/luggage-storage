import type { FaqItem } from "@/lib/i18n";

/**
 * Plain <details>/<summary> accordion — no client JS needed, and the
 * answers are in the DOM (not hidden behind a client-only toggle), which
 * matters both for accessibility and for crawlers reading the FAQ content.
 */
export function Faq({ heading, items }: { heading: string; items: FaqItem[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">{heading}</h2>
      <div className="mt-4 divide-y rounded-xl border">
        {items.map((item) => (
          <details key={item.question} className="group p-4">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span
                  aria-hidden
                  className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="text-muted-foreground mt-2 text-sm">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
