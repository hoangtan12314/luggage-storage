"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-only bottom bar ("From 219,000 ₫ · Check availability") that shows
 * while the booking card is scrolled out of view and takes the guest back to
 * it. Hidden from lg up, where the card itself is sticky.
 */
export function StickyBookBar({
  targetId,
  fromLabel,
  price,
  cta,
}: {
  targetId: string;
  fromLabel: string;
  price: string;
  cta: string;
}) {
  // Assume the card is visible until the observer says otherwise, so the bar
  // never flashes on first paint.
  const [cardVisible, setCardVisible] = useState(true);
  // The bar also steps aside once the footer is on screen, so it never covers
  // the footer's last lines (copyright, links) at the bottom of the page.
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  function goToCard() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    document.getElementById("avail-date")?.focus({ preventScroll: true });
  }

  if (cardVisible || footerVisible) return null;

  return (
    <div className="border-cocoa/10 bg-cream-2/95 fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(90,55,20,0.3)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <p className="leading-tight">
          <span className="text-cocoa-muted block text-xs">{fromLabel}</span>
          <span className="text-brand-ink text-lg font-bold tabular-nums">{price}</span>
        </p>
        <button
          type="button"
          onClick={goToCard}
          className="bg-gold focus-visible:ring-ring min-h-12 cursor-pointer rounded-full px-6 text-[15px] font-medium text-cocoa shadow-sm transition-[filter] duration-200 outline-none hover:brightness-95 focus-visible:ring-2"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
