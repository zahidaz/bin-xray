"use client";

import dynamic from "next/dynamic";

const modules: Record<string, React.ComponentType> = {
  "01-compilation-pipeline": dynamic(() => import("./content/Module01")),
  "02-elf-header": dynamic(() => import("./content/Module02")),
  "03-sections-vs-segments": dynamic(() => import("./content/Module03")),
  "04-sections-deep-dive": dynamic(() => import("./content/Module04")),
  "05-segments-and-loading": dynamic(() => import("./content/Module05")),
  "06-dynamic-linking": dynamic(() => import("./content/Module06")),
};

export function ModuleRenderer({ slug }: { slug: string }) {
  const Component = modules[slug];
  if (!Component) return null;
  return <Component />;
}
