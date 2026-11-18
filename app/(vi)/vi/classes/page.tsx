import type { Metadata } from "next";
import { ClassesPlaceholder } from "@/components/classes-placeholder";
import { classesCopy } from "@/lib/i18n";
import { noIndexMetadata } from "@/lib/seo";

// Placeholder until cooking classes can be booked online: kept out of search
// results (and out of the sitemap) so it never ranks as a thin page.
export const metadata: Metadata = {
  ...noIndexMetadata,
  title: { absolute: classesCopy.vi.meta.title },
  description: classesCopy.vi.meta.description,
};

export default function ClassesPage() {
  return <ClassesPlaceholder locale="vi" />;
}
