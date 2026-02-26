"use client";

import { useEffect, useMemo } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";
import { ChapterLayout } from "@/components/narrative/ChapterLayout";
import { ScrollSection } from "@/components/narrative/ScrollSection";
import { Callout } from "@/components/narrative/Callout";
import { Quiz } from "@/components/narrative/Quiz";
import { StructViewer } from "@/components/struct-viewer/StructViewer";
import { MemoryMap } from "@/components/memory-map/MemoryMap";
import { ELF64_PHDR_META } from "@/config/structs";
import { P_TYPE, decodePhdrFlags } from "@/lib/elf/constants";

export default function Module05() {
  const loadSample = useBinaryStore((s) => s.loadSample);
  const parsed = useBinaryStore((s) => s.parsed);

  useEffect(() => {
    loadSample("hello-dynamic.bin");
  }, [loadSample]);

  const loadSegments = useMemo(
    () => parsed?.programs.filter((p) => p.p_type === 1) ?? [],
    [parsed]
  );

  return (
    <ChapterLayout
      title="Segments and Loading"
      moduleNumber={5}
      prevSlug="04-sections-deep-dive"
      nextSlug="06-dynamic-linking"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <ScrollSection>
          <p className="text-zinc-300 text-lg leading-relaxed">
            While sections organize a binary for the linker, program headers (segments) tell
            the kernel how to load the binary into memory. The kernel ignores section names
            entirely &mdash; it only reads the program header table.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-6">Memory Map</h2>
          <MemoryMap />
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">PT_LOAD &mdash; The Workhorse</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            PT_LOAD segments are the only ones that actually get mapped into memory. A typical
            executable has two or three PT_LOAD segments:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="font-mono text-xs text-green-400 mb-1">R X</div>
              <h3 className="text-sm font-bold text-white mb-1">Code Segment</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Contains .text, .rodata, and other read/execute sections. Mapped as readable
                and executable but not writable.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="font-mono text-xs text-yellow-400 mb-1">R W</div>
              <h3 className="text-sm font-bold text-white mb-1">Data Segment</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Contains .data, .bss, .got, and other writable sections. Mapped as readable
                and writable.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="font-mono text-xs text-blue-400 mb-1">R</div>
              <h3 className="text-sm font-bold text-white mb-1">Read-Only Segment</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Contains the ELF header, program headers, and other metadata. Mapped as
                read-only.
              </p>
            </div>
          </div>
          {loadSegments.map((seg) => (
            <div key={seg.index} className="mb-6">
              <StructViewer
                struct={ELF64_PHDR_META}
                baseOffset={Number(parsed!.header.e_phoff)}
                entryIndex={seg.index}
                label={`Elf64_Phdr[${seg.index}] (PT_LOAD)`}
              />
            </div>
          ))}
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">PT_INTERP &mdash; Dynamic Linker Path</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            This segment contains a single null-terminated string: the path to the dynamic
            linker (usually{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              /lib64/ld-linux-x86-64.so.2
            </code>
            ). When the kernel loads a dynamically-linked executable, it reads this path and
            hands control to the dynamic linker before your program&apos;s{" "}
            <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">main()</code> runs.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">PT_DYNAMIC &mdash; Dynamic Section Pointer</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Points to the <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.dynamic
            </code> section, which contains the roadmap for dynamic linking: which shared libraries
            to load, where to find the symbol table, relocation entries, and more. The dynamic
            linker reads this to set up the process.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">p_memsz {">"} p_filesz &mdash; The BSS Gap</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            When a segment&apos;s memory size exceeds its file size, the extra bytes are
            zero-filled by the kernel. This is how .bss data gets included in a PT_LOAD
            segment without wasting disk space. The segment covers both initialized data
            (from the file) and uninitialized data (zero-filled by the kernel).
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 font-mono text-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-zinc-500">File:</span>
              <div className="flex-1 h-6 bg-blue-600/30 rounded flex items-center px-2">
                <span className="text-blue-300 text-xs">p_filesz bytes from disk</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Mem:</span>
              <div className="flex-1 flex h-6 rounded overflow-hidden">
                <div className="flex-[3] bg-blue-600/30 flex items-center px-2">
                  <span className="text-blue-300 text-xs">file data</span>
                </div>
                <div className="flex-[1] bg-yellow-600/30 flex items-center px-2">
                  <span className="text-yellow-300 text-xs">zeros (BSS)</span>
                </div>
              </div>
            </div>
            <div className="text-zinc-500 text-xs mt-2 text-center">
              p_memsz = p_filesz + BSS size
            </div>
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Callout variant="insight" title="Kernel vs Linker">
            The kernel doesn&apos;t care about section names. It only reads program headers.
            Sections like .text, .data, and .rodata are meaningful to the linker and debugger,
            but the kernel maps memory based purely on PT_LOAD segments and their permission flags.
          </Callout>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-6">Program Header Table</h2>
          {parsed ? (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-700 bg-zinc-900">
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        #
                      </th>
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Type
                      </th>
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Flags
                      </th>
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 text-right">
                        Offset
                      </th>
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 text-right">
                        VAddr
                      </th>
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 text-right">
                        FileSz
                      </th>
                      <th className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 text-right">
                        MemSz
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.programs.map((phdr) => (
                      <tr
                        key={phdr.index}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-3 py-2 text-xs font-mono text-zinc-500">
                          {phdr.index}
                        </td>
                        <td className="px-3 py-2 text-sm font-mono text-blue-400">
                          {P_TYPE[phdr.p_type] ?? `0x${phdr.p_type.toString(16)}`}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-zinc-400">
                          {decodePhdrFlags(phdr.p_flags)}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-zinc-400 text-right">
                          0x{phdr.p_offset.toString(16)}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-zinc-400 text-right">
                          0x{phdr.p_vaddr.toString(16)}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono text-zinc-400 text-right">
                          0x{phdr.p_filesz.toString(16)}
                        </td>
                        <td className={`px-3 py-2 text-xs font-mono text-right ${
                          phdr.p_memsz > phdr.p_filesz
                            ? "text-yellow-400"
                            : "text-zinc-400"
                        }`}>
                          0x{phdr.p_memsz.toString(16)}
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
            question="Why might p_memsz be larger than p_filesz?"
            options={[
              {
                text: "The file is corrupted",
                correct: false,
                explanation:
                  "This is normal and expected behavior, not corruption.",
              },
              {
                text: "BSS / zero-initialized data that doesn't need disk space",
                correct: true,
                explanation:
                  "Correct! When p_memsz > p_filesz, the extra bytes represent BSS data. The kernel zero-fills this gap in memory, saving disk space for variables that start at zero.",
              },
              {
                text: "Alignment padding added by the linker",
                correct: false,
                explanation:
                  "While alignment does affect segment layout, the memsz > filesz gap specifically represents zero-initialized (BSS) data.",
              },
              {
                text: "Debug information stored in memory only",
                correct: false,
                explanation:
                  "Debug information is stored in its own sections and doesn't affect the memsz/filesz relationship this way.",
              },
            ]}
          />
        </ScrollSection>
      </div>
    </ChapterLayout>
  );
}
