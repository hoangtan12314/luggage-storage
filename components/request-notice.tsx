import { MessageCircle } from "lucide-react";

/**
 * The "this is a request, not a confirmed booking" box shown on the booking
 * forms and on the request-received page: we contact the guest (usually on
 * WhatsApp) to confirm, and email them once it is agreed.
 */
export function RequestNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-gold/60 bg-gold/15 flex items-start gap-3 rounded-2xl border p-4 text-cocoa">
      <MessageCircle aria-hidden className="text-brand-ink mt-0.5 size-6 shrink-0" strokeWidth={1.6} />
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        <p className="text-cocoa-muted mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
