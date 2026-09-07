import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only the public, indexable pages — checkout and booking confirmation are
  // intentionally excluded (see app/robots.ts and their own noindex meta).
  const languages = { en: `${SITE_URL}/`, vi: `${SITE_URL}/vi` };

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/vi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
