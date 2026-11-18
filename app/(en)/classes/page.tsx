import type { Metadata } from "next";
import { ClassesPage } from "@/components/classes-page";
import { buildClassesMetadata } from "@/lib/seo";

export const metadata: Metadata = buildClassesMetadata("en");

export default function ClassesEn() {
  return <ClassesPage locale="en" />;
}
