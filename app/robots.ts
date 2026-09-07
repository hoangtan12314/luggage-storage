import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/vi"],
      // Checkout and booking confirmation carry guest personal details and
      // must never be crawled — see the noindex meta on those pages too.
      disallow: ["/checkout", "/booking/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
