"use client";

import { useEffect, useMemo } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";
import { ChapterLayout } from "@/components/narrative/ChapterLayout";
import { ScrollSection } from "@/components/narrative/ScrollSection";
import { Callout } from "@/components/narrative/Callout";
import { Quiz } from "@/components/narrative/Quiz";
import { StructViewer } from "@/components/struct-viewer/StructViewer";
import { ELF64_SHDR_META, ELF64_SYM_META } from "@/config/structs";
import { SH_TYPE, decodeShdrFlags } from "@/lib/elf/constants";

export default function Module04() {
  const loadSample = useBinaryStore((s) => s.loadSample);
  const parsed = useBinaryStore((s) => s.parsed);

  useEffect(() => {
    loadSample("hello-dynamic.bin");
  }, [loadSample]);

  const textSection = useMemo(
    () => parsed?.sections.find((s) => s.resolvedName === ".text"),
    [parsed]
  );

  const symtabSection = useMemo(
    () => parsed?.sections.find((s) => s.resolvedName === ".symtab"),
    [parsed]
  );

  return (
    <ChapterLayout
      title="Sections Deep Dive"
      moduleNumber={4}
      prevSlug="03-sections-vs-segments"
      nextSlug="05-segments-and-loading"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <ScrollSection>
          <p className="text-zinc-300 text-lg leading-relaxed">
            Sections are the linker&apos;s view of a binary. Each section has a specific
            purpose: holding executable code, data, symbol information, or strings. Let&apos;s
            explore the most important ones.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">.text &mdash; Executable Code</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            The <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.text</code> section
            contains the compiled machine instructions of your program. This is where your functions
            live after compilation. The section is marked executable (X) and allocatable (A), but
            never writable &mdash; modifying code at runtime would be a security risk.
          </p>
          {textSection && parsed && (
            <StructViewer
              struct={ELF64_SHDR_META}
              baseOffset={Number(parsed.header.e_shoff)}
              entryIndex={textSection.index}
              label={`Elf64_Shdr [.text]`}
            />
          )}
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">.data / .bss &mdash; Program Data</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Global and static variables land in one of two sections depending on their
            initialization state:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-mono text-sm font-bold text-green-400 mb-2">.data</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Initialized data. Variables like{" "}
                <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
                  int count = 42;
                </code>{" "}
                occupy space both on disk and in memory. Writable at runtime.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-mono text-sm font-bold text-yellow-400 mb-2">.bss</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Uninitialized data. Variables like{" "}
                <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
                  int buffer[4096];
                </code>{" "}
                take zero bytes on disk but expand to full size in memory.
              </p>
            </div>
          </div>

          <Callout variant="question" title="BSS Puzzle">
            sh_size {">"} 0 but zero bytes on disk. Where does the memory come from?
            The kernel zero-fills pages. The BSS section has type SHT_NOBITS, telling the
            loader to allocate memory without reading anything from the file.
          </Callout>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">.rodata &mdash; Read-Only Data</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            String literals, constant arrays, and other immutable data live in{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.rodata</code>.
            When you write <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">
            printf(&quot;Hello, world!\n&quot;)</code>, the string{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">
            &quot;Hello, world!\n&quot;</code> is stored here. This section is mapped read-only
            in memory &mdash; any attempt to modify it triggers a segmentation fault.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            .symtab / .strtab &mdash; Symbol and String Tables
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            The symbol table (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">
            .symtab</code>) is the binary&apos;s phone book. Each entry maps a name to an
            address, size, and type. Function names, global variables, and section references
            all appear here. The actual name strings are stored separately in{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.strtab</code>,
            with <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
            st_name</code> being an offset into that string table.
          </p>
          {symtabSection && parsed && (
            <StructViewer
              struct={ELF64_SYM_META}
              baseOffset={Number(symtabSection.sh_offset)}
              entryIndex={0}
              label="Elf64_Sym[0]"
            />
          )}
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            .shstrtab &mdash; Section Header String Table
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            This special string table holds the names of sections themselves. When the{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">sh_name</code> field
            in a section header says <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
            27</code>, it means &quot;go to offset 27 in .shstrtab and read the null-terminated
            string there.&quot; The ELF header&apos;s{" "}
            <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
            e_shstrndx</code> field tells you which section index is .shstrtab.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-6">Section Table</h2>
          {parsed ? (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-700 bg-zinc-900">
                      <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        #
                      </th>
                      <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Name
                      </th>
                      <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Type
                      </th>
                      <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Flags
                      </th>
                      <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 text-right">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.sections.map((section) => (
                      <tr
                        key={section.index}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-4 py-2 text-xs font-mono text-zinc-500">
                          {section.index}
                        </td>
                        <td className="px-4 py-2 text-sm font-mono text-blue-400">
                          {section.resolvedName || "(null)"}
                        </td>
                        <td className="px-4 py-2 text-xs font-mono text-zinc-400">
                          {SH_TYPE[section.sh_type] ?? `0x${section.sh_type.toString(16)}`}
                        </td>
                        <td className="px-4 py-2 text-xs font-mono text-zinc-400">
                          {decodeShdrFlags(section.sh_flags)}
                        </td>
                        <td className="px-4 py-2 text-xs font-mono text-zinc-400 text-right">
                          0x{section.sh_size.toString(16)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-zinc-500">
              Loading binary...
            </div>
          )}
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Quiz
            question="Which section type has SHT_NOBITS?"
            options={[
              {
                text: ".text",
                correct: false,
                explanation:
                  ".text contains executable code and uses SHT_PROGBITS since it has actual bytes on disk.",
              },
              {
                text: ".data",
                correct: false,
                explanation:
                  ".data holds initialized variables and uses SHT_PROGBITS since those initial values are stored on disk.",
              },
              {
                text: ".bss",
                correct: true,
                explanation:
                  "Correct! .bss uses SHT_NOBITS because uninitialized data doesn't need to occupy space on disk. The kernel zero-fills the memory at load time.",
              },
              {
                text: ".strtab",
                correct: false,
                explanation:
                  ".strtab holds null-terminated strings and uses SHT_STRTAB. It definitely has bytes on disk.",
              },
            ]}
          />
        </ScrollSection>
      </div>
    </ChapterLayout>
  );
}
