import { notFound } from "next/navigation";
import { ModuleRenderer } from "./ModuleRenderer";

const MODULE_SLUGS = [
  "01-compilation-pipeline",
  "02-elf-header",
  "03-sections-vs-segments",
  "04-sections-deep-dive",
  "05-segments-and-loading",
  "06-dynamic-linking",
];

export function generateStaticParams() {
  return MODULE_SLUGS.map((slug) => ({ slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!MODULE_SLUGS.includes(slug)) notFound();

  return <ModuleRenderer slug={slug} />;
}
