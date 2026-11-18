import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassDetailPage } from "@/components/class-detail-page";
import { CLASS_TYPES, getClassType } from "@/lib/config";
import { buildClassTypeMetadata } from "@/lib/seo";

// One static page per class type; any other slug is a real 404 (not a soft 200).
// Next logs an internal "NoFallbackError" for those requests — it is benign.
export const dynamicParams = false;

export function generateStaticParams() {
  return CLASS_TYPES.map((t) => ({ type: t.slug }));
}

export async function generateMetadata(props: PageProps<"/classes/[type]">): Promise<Metadata> {
  const { type } = await props.params;
  return buildClassTypeMetadata("en", type);
}

export default async function ClassTypePage(props: PageProps<"/classes/[type]">) {
  const { type: slug } = await props.params;
  const type = getClassType(slug);
  if (!type) notFound();
  return <ClassDetailPage type={type} locale="en" />;
}
