import type { Metadata } from "next";
import { ClassesPage } from "@/components/classes-page";
import { buildClassesMetadata } from "@/lib/seo";

export const metadata: Metadata = buildClassesMetadata("vi");

export default function ClassesVi() {
  return <ClassesPage locale="vi" />;
}
