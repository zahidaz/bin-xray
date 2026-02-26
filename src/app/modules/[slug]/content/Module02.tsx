"use client";

import { useEffect } from "react";
import { ChapterLayout } from "@/components/narrative/ChapterLayout";
import { ScrollSection } from "@/components/narrative/ScrollSection";
import { Callout } from "@/components/narrative/Callout";
import { Quiz } from "@/components/narrative/Quiz";
import { HexViewer } from "@/components/hex-viewer/HexViewer";
import { StructViewer } from "@/components/struct-viewer/StructViewer";
import { ELF64_EHDR_META } from "@/config/structs";
import { useBinaryStore } from "@/lib/store/binary-store";
import { useUiStore } from "@/lib/store/ui-store";

export default function Module02() {
  const loadSample = useBinaryStore((s) => s.loadSample);
  const parsed = useBinaryStore((s) => s.parsed);
  const loading = useBinaryStore((s) => s.loading);
  const setHighlightRange = useUiStore((s) => s.setHighlightRange);

  useEffect(() => {
    if (!parsed && !loading) {
      loadSample("hello-dynamic.bin");
    }
  }, [parsed, loading, loadSample]);

  useEffect(() => {
    setHighlightRange({ start: 0, end: 64, source: "module" });
    return () => setHighlightRange(null);
  }, [setHighlightRange]);

  return (
    <ChapterLayout
      title="The ELF Header"
      moduleNumber={2}
      prevSlug="01-compilation-pipeline"
      nextSlug="03-sections-vs-segments"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <ScrollSection>
          <p className="text-zinc-300 text-lg leading-relaxed">
            Every ELF file begins with a 64-byte header. This small region is
            the most important part of the binary: it tells the operating system
            what kind of file this is, what architecture it targets, where to
            find the program headers and section headers, and where execution
            should begin. Without a valid ELF header, the kernel will refuse to
            load the file.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <p className="text-zinc-400 leading-relaxed">
            The ELF header is defined by the C struct{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">Elf64_Ehdr</code>.
            Every field has a precise offset, size, and meaning. What you see
            below is the actual content of a real ELF binary, decoded field by
            field. Hover over any field in the struct viewer to see it
            highlighted in the hex dump.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <div className="h-[500px]">
            <HexViewer />
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <StructViewer struct={ELF64_EHDR_META} baseOffset={0} />
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            The Magic Number
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The first four bytes of every ELF file are always{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">7f 45 4c 46</code>,
            which is <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">0x7f</code> followed
            by the ASCII characters <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">E</code>,{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">L</code>,{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">F</code>. This magic
            number is how the kernel, dynamic linker, and tools like{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">file</code> identify
            that a file is an ELF binary rather than a script, a JPEG, or random
            data.
          </p>
          <Callout variant="insight" title="Why magic bytes matter">
            Magic bytes are a convention used across all binary file formats. PNG
            files start with <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">89 50 4e 47</code>,
            Java class files with <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">ca fe ba be</code>,
            and Mach-O binaries (macOS) with <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">fe ed fa ce</code>.
            The leading <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">0x7f</code> byte in
            ELF is deliberately a non-printable character, ensuring that if you
            accidentally <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">cat</code> a
            binary to the terminal, it will not be interpreted as a shell script.
          </Callout>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Class: 32-bit vs 64-bit
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Byte offset 4 (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_ident[EI_CLASS]</code>)
            tells the system whether this is a 32-bit or 64-bit ELF. A value of{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">0x01</code> means
            ELFCLASS32 (32-bit), and{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">0x02</code> means
            ELFCLASS64 (64-bit). This single byte determines the size of
            address fields throughout the entire file. In a 64-bit ELF,
            addresses and offsets are 8 bytes wide. In 32-bit, they are 4 bytes.
            This means the ELF header itself is 64 bytes for ELF64 and 52 bytes
            for ELF32.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Endianness
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Byte offset 5 (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_ident[EI_DATA]</code>)
            specifies the byte order for all multi-byte fields in the file.{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">0x01</code> means
            little-endian (least significant byte first), the standard for x86
            and ARM in LE mode.{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">0x02</code> means
            big-endian (most significant byte first), used by some MIPS and
            PowerPC systems. Getting the endianness wrong means every multi-byte
            field you read will have its bytes reversed.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            ELF Type
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_type</code> field
            at offset 16 identifies the kind of ELF file. The four most common
            types are:
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                code: "ET_REL (1)",
                name: "Relocatable",
                desc: "Object files (.o) produced by the assembler, not yet linked",
              },
              {
                code: "ET_EXEC (2)",
                name: "Executable",
                desc: "Statically addressed executables with fixed virtual addresses",
              },
              {
                code: "ET_DYN (3)",
                name: "Shared Object",
                desc: "Shared libraries (.so) and position-independent executables (PIE)",
              },
              {
                code: "ET_CORE (4)",
                name: "Core Dump",
                desc: "Memory snapshot from a crashed process for post-mortem debugging",
              },
            ].map((t) => (
              <div
                key={t.code}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="font-mono text-sm text-blue-400 mb-1">
                  {t.code}
                </div>
                <div className="text-sm font-semibold text-zinc-200 mb-1">
                  {t.name}
                </div>
                <div className="text-xs text-zinc-500">{t.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Modern Linux distributions compile most executables as{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">ET_DYN</code> (type 3)
            with position-independent code, even though they are executables.
            This enables ASLR (Address Space Layout Randomization) as a security
            measure.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Machine Architecture
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            The <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_machine</code> field
            at offset 18 identifies the target instruction set architecture.
            Common values include{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">EM_X86_64</code> (0x3e)
            for AMD64/Intel 64,{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">EM_AARCH64</code> (0xb7)
            for 64-bit ARM, and{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">EM_RISCV</code> (0xf3)
            for RISC-V. The kernel will refuse to execute a binary whose machine
            type does not match the current CPU architecture.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Entry Point
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            The <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">e_entry</code> field
            at offset 24 holds the virtual address where execution begins after
            the kernel loads the program. This is not{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">main()</code>. In a
            typical C program, the entry point is{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">_start</code>, a small
            stub provided by the C runtime library (crt1.o) that sets up the
            stack, initializes the C library, and then calls{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">main()</code>. For
            relocatable object files, this field is zero because they have no
            entry point.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Table Offsets
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The final group of fields tells the system where to find two critical
            data structures:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="font-mono text-sm text-blue-400 mb-1">
                e_phoff / e_phentsize / e_phnum
              </div>
              <p className="text-sm text-zinc-400">
                The file offset, entry size, and count for the Program Header
                Table. Program headers define segments that describe how the file
                should be mapped into memory. Without them, the kernel cannot
                load the executable.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="font-mono text-sm text-blue-400 mb-1">
                e_shoff / e_shentsize / e_shnum
              </div>
              <p className="text-sm text-zinc-400">
                The file offset, entry size, and count for the Section Header
                Table. Section headers provide the linker&apos;s view of the
                binary: named regions like .text, .data, .rodata. These are
                optional for execution but essential for debugging and tooling.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="font-mono text-sm text-blue-400 mb-1">
                e_shstrndx
              </div>
              <p className="text-sm text-zinc-400">
                The index of the section that contains the section name strings.
                Section names like &quot;.text&quot; and &quot;.data&quot; are stored in a
                dedicated string table section, and this field points to it.
              </p>
            </div>
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Quiz
            question="What does the value 0x02 at offset 4 (e_ident[EI_CLASS]) mean?"
            options={[
              {
                text: "The file uses big-endian byte ordering",
                correct: false,
                explanation:
                  "Endianness is specified at offset 5 (EI_DATA), not offset 4. The value 0x02 at offset 5 would mean big-endian.",
              },
              {
                text: "This is a 64-bit ELF file",
                correct: true,
                explanation:
                  "EI_CLASS at offset 4 specifies the binary class. 0x01 means 32-bit (ELFCLASS32) and 0x02 means 64-bit (ELFCLASS64). This affects the size of all address and offset fields throughout the file.",
              },
              {
                text: "The ELF version number is 2",
                correct: false,
                explanation:
                  "The ELF version is at offset 6 (EI_VERSION). The current and only version is 1 (EV_CURRENT).",
              },
              {
                text: "The file is an executable (ET_EXEC)",
                correct: false,
                explanation:
                  "The ELF type is at offset 16 (e_type), not offset 4. ET_EXEC has value 2, but that is a different field entirely.",
              },
            ]}
          />
        </ScrollSection>
      </div>
    </ChapterLayout>
  );
}
