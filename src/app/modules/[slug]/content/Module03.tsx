"use client";

import { useEffect } from "react";
import { ChapterLayout } from "@/components/narrative/ChapterLayout";
import { ScrollSection } from "@/components/narrative/ScrollSection";
import { Callout } from "@/components/narrative/Callout";
import { Quiz } from "@/components/narrative/Quiz";
import { SectionSegmentToggle } from "@/components/section-segment/SectionSegmentToggle";
import { useBinaryStore } from "@/lib/store/binary-store";

function ComparisonTable() {
  const rows = [
    {
      aspect: "Purpose",
      sections: "Organize data for linking, debugging, and tooling",
      segments: "Describe how to map the file into memory for execution",
    },
    {
      aspect: "Used by",
      sections: "Linker (ld), debugger (gdb), readelf, objdump",
      segments: "Kernel (execve), dynamic linker (ld-linux.so)",
    },
    {
      aspect: "Described in",
      sections: "Section Header Table (e_shoff)",
      segments: "Program Header Table (e_phoff)",
    },
    {
      aspect: "Granularity",
      sections: "Fine-grained: .text, .rodata, .data, .bss, ...",
      segments: "Coarse-grained: LOAD, DYNAMIC, INTERP, ...",
    },
    {
      aspect: "Required for execution",
      sections: "No (can be stripped entirely)",
      segments: "Yes (kernel refuses to load without them)",
    },
    {
      aspect: "Naming",
      sections: "Named via string table (.shstrtab)",
      segments: "Identified by type constant (PT_LOAD, etc.)",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900 border-b border-zinc-700">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Aspect
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Sections
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-violet-400">
              Segments
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.aspect}
              className="border-b border-zinc-800 last:border-b-0"
            >
              <td className="px-4 py-3 font-medium text-zinc-300">
                {row.aspect}
              </td>
              <td className="px-4 py-3 text-zinc-400">{row.sections}</td>
              <td className="px-4 py-3 text-zinc-400">{row.segments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsingDiagram() {
  const sectionGroups = [
    {
      segment: "LOAD (R)",
      segmentColor: "border-violet-500/60 bg-violet-500/5",
      sections: [
        { name: ".rodata", color: "bg-emerald-500/20 border-emerald-500/40" },
        { name: ".eh_frame", color: "bg-emerald-500/20 border-emerald-500/40" },
        {
          name: ".eh_frame_hdr",
          color: "bg-emerald-500/20 border-emerald-500/40",
        },
      ],
    },
    {
      segment: "LOAD (RX)",
      segmentColor: "border-blue-500/60 bg-blue-500/5",
      sections: [
        { name: ".init", color: "bg-blue-500/20 border-blue-500/40" },
        { name: ".plt", color: "bg-blue-500/20 border-blue-500/40" },
        { name: ".text", color: "bg-blue-500/20 border-blue-500/40" },
        { name: ".fini", color: "bg-blue-500/20 border-blue-500/40" },
      ],
    },
    {
      segment: "LOAD (RW)",
      segmentColor: "border-amber-500/60 bg-amber-500/5",
      sections: [
        { name: ".data", color: "bg-amber-500/20 border-amber-500/40" },
        { name: ".got.plt", color: "bg-amber-500/20 border-amber-500/40" },
        { name: ".bss", color: "bg-amber-500/20 border-amber-500/40" },
      ],
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
        How Sections Collapse Into Segments
      </h3>
      <div className="space-y-4">
        {sectionGroups.map((group) => (
          <div
            key={group.segment}
            className={`rounded-lg border ${group.segmentColor} p-4`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-semibold text-zinc-300">
                {group.segment}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Segment
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.sections.map((section) => (
                <div
                  key={section.name}
                  className={`rounded border ${section.color} px-3 py-1.5 font-mono text-xs text-zinc-300`}
                >
                  {section.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Module03() {
  const loadSample = useBinaryStore((s) => s.loadSample);
  const parsed = useBinaryStore((s) => s.parsed);
  const loading = useBinaryStore((s) => s.loading);

  useEffect(() => {
    if (!parsed && !loading) {
      loadSample("hello-dynamic.bin");
    }
  }, [parsed, loading, loadSample]);

  return (
    <ChapterLayout
      title="Sections vs Segments"
      moduleNumber={3}
      prevSlug="02-elf-header"
      nextSlug="04-sections-deep-dive"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <ScrollSection>
          <p className="text-zinc-300 text-lg leading-relaxed">
            An ELF binary can be viewed through two fundamentally different
            lenses. Sections provide the linker&apos;s perspective: a
            fine-grained decomposition of the file into named regions like{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.text</code>,{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.data</code>, and{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.rodata</code>.
            Segments provide the loader&apos;s perspective: coarse groups of
            bytes that should be mapped into memory with specific permissions.
            Mastering ELF means understanding both views and how they relate.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            The Linker&apos;s View: Sections
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Sections are the building blocks that the linker works with. When
            you compile multiple source files into object files, each object
            file has its own <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.text</code> section
            (code), its own <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.data</code> section
            (initialized global variables), its own{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.rodata</code> section
            (read-only data like string literals), and so on. The linker&apos;s job
            is to merge matching sections from all input objects into single
            output sections, resolve cross-references, and assign addresses.
          </p>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Sections are described by the Section Header Table, an array of{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">Elf64_Shdr</code> structs
            located at the file offset given by <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_shoff</code> in
            the ELF header. Each entry records the section&apos;s name (as an
            index into the section name string table), type, flags, file offset,
            size, and alignment. A typical dynamically linked executable might
            have 25 to 30 sections.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Sections are not required for execution. Tools like{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">strip</code> can
            remove the entire section header table and all non-loadable sections
            from a binary. The kernel does not need sections to load and run the
            program. However, debuggers, profilers, and disassemblers rely
            heavily on section information to make sense of the binary.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            The Loader&apos;s View: Segments
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Segments are the kernel&apos;s roadmap for loading a binary into memory.
            When you run an executable, the kernel reads the Program Header
            Table (an array of <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">Elf64_Phdr</code> structs
            at <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_phoff</code>) and
            uses it to create memory mappings. Each{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_LOAD</code> segment
            specifies a range of bytes in the file, a virtual address to map
            them to, and permission flags (read, write, execute).
          </p>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The kernel does not care about section names or boundaries. It only
            cares about segments. A single <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_LOAD</code> segment
            with execute permission might encompass sections{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.init</code>,{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.plt</code>,{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.text</code>, and{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.fini</code>, all
            mapped as a single contiguous chunk with{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">r-x</code> permissions.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Beyond <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_LOAD</code>,
            other segment types carry metadata: <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_INTERP</code> names
            the dynamic linker, <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_DYNAMIC</code> points
            to the .dynamic section for runtime linking, <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_NOTE</code> carries
            build metadata, and <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">PT_GNU_STACK</code> controls
            stack executability.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            How Sections Collapse Into Segments
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The relationship between sections and segments is many-to-one:
            multiple sections can be contained within a single segment. The
            linker groups sections by their memory protection attributes.
            Sections that need the same permissions end up in the same segment.
          </p>
          <CollapsingDiagram />
          <p className="text-zinc-400 leading-relaxed mt-4">
            This grouping is not arbitrary. Memory protection is applied at the
            page level (typically 4 KiB granularity). Making each section its
            own mapping would waste enormous amounts of address space on padding.
            By coalescing sections with compatible permissions into single
            segments, the linker minimizes the number of memory mappings and
            reduces page-alignment waste.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Callout variant="insight" title="Sections are for the linker, segments are for the loader">
            This is the single most important distinction in ELF anatomy.
            Sections give tools detailed, named access to every part of the
            binary. Segments give the kernel the minimal information needed to
            load and run the program. A fully stripped binary with zero sections
            can run perfectly, but a binary without valid program headers cannot
            be loaded at all. Both views overlay the same bytes in the file;
            they are two different indexes into the same data.
          </Callout>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Side-by-Side Comparison
          </h2>
          <ComparisonTable />
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Explore the Binary
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Toggle between the sections and segments views below to see how
            the same bytes in the file are organized differently depending on
            your perspective. The section view shows fine-grained named regions.
            The segment view shows coarse memory mappings. Hover over any
            region to see its extent in the byte map.
          </p>
          <SectionSegmentToggle />
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Quiz
            question="Can a stripped binary (one with all section headers removed) still be executed?"
            options={[
              {
                text: "No, the kernel needs section headers to find .text and .data",
                correct: false,
                explanation:
                  "The kernel never reads section headers. It loads the program entirely through the program header table (segments). Sections are a convenience for tools, not a requirement for execution.",
              },
              {
                text: "Yes, because the kernel uses segments (program headers), not sections, to load the binary",
                correct: true,
                explanation:
                  "The kernel only needs the program header table to map the file into memory. Sections can be completely removed with strip without affecting execution. Debuggers and disassemblers will have a harder time, but the program runs fine.",
              },
              {
                text: "Only if it is statically linked",
                correct: false,
                explanation:
                  "Both statically and dynamically linked binaries can be stripped. The dynamic linker also uses segments (PT_DYNAMIC, PT_INTERP), not section headers, to resolve dependencies.",
              },
              {
                text: "Only on certain kernel versions",
                correct: false,
                explanation:
                  "All Linux kernel versions load ELF binaries using program headers. Section header support for loading has never been part of the kernel's ELF loader.",
              },
            ]}
          />
        </ScrollSection>
      </div>
    </ChapterLayout>
  );
}
