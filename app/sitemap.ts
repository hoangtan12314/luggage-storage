import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * One entry per page per language, each with its own hreflang alternates
 * pointing at its own translation counterpart — not all pages cross-linked
 * to each other. Landing, luggage and rooms are three different pieces of
 * content, each with an EN/VI pair.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { en: string; vi: string }[] = [
    { en: "/", vi: "/vi" },
    { en: "/luggage", vi: "/vi/luggage" },
    { en: "/rooms", vi: "/vi/rooms" },
  ];

  const now = new Date();

  return pages.flatMap(({ en, vi }) => {
    const languages = { en: `${SITE_URL}${en}`, vi: `${SITE_URL}${vi}` };
    return [
      {
        url: `${SITE_URL}${en}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: en === "/" ? 1 : 0.8,
        alternates: { languages },
      },
      {
        url: `${SITE_URL}${vi}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: en === "/" ? 1 : 0.8,
        alternates: { languages },
      },
    ];
  });
}
