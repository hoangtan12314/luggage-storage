import type { NextConfig } from "next";
import { VIETNAMESE_ENABLED } from "./lib/config";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['gates-arch-playing-skating.trycloudflare.com'],

  // Vietnamese is temporarily switched off (VIETNAMESE_ENABLED in lib/config.ts).
  // Any /vi URL — old links, search results — lands on the English page. These
  // are temporary (307) redirects so browsers and crawlers don't cache them
  // when the language comes back.
  async redirects() {
    if (VIETNAMESE_ENABLED) return [];
    return [
      { source: "/vi", destination: "/", permanent: false },
      { source: "/vi/:path*", destination: "/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
