"use client";

import { ChapterLayout } from "@/components/narrative/ChapterLayout";
import { ScrollSection } from "@/components/narrative/ScrollSection";
import { Callout } from "@/components/narrative/Callout";
import { Quiz } from "@/components/narrative/Quiz";
import { PipelineViewer } from "@/components/pipeline/PipelineViewer";

const PIPELINE_STAGES = [
  { label: "hello.c", stage: "Source", color: "bg-blue-500" },
  { label: "hello.i", stage: "Preprocessor", color: "bg-violet-500" },
  { label: "hello.s", stage: "Compiler", color: "bg-amber-500" },
  { label: "hello.o", stage: "Assembler", color: "bg-emerald-500" },
  { label: "hello", stage: "Linker", color: "bg-rose-500" },
];

function PipelineDiagram() {
  return (
    <div className="flex items-center justify-between gap-2 py-8 overflow-x-auto">
      {PIPELINE_STAGES.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`${item.color} rounded-lg px-4 py-3 text-white font-mono text-sm font-bold shadow-lg`}
            >
              {item.label}
            </div>
            <span className="text-[11px] text-zinc-400">{item.stage}</span>
          </div>
          {i < PIPELINE_STAGES.length - 1 && (
            <div className="flex items-center gap-1 -mt-5">
              <div className="w-6 h-px bg-zinc-600" />
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-zinc-600" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Module01() {
  return (
    <ChapterLayout
      title="From Source to Binary"
      moduleNumber={1}
      nextSlug="02-elf-header"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <ScrollSection>
          <p className="text-zinc-300 text-lg leading-relaxed">
            Every executable on a Linux system begins its life as human-readable
            source code. But the CPU does not understand C, Rust, or Go. It
            speaks only one language: machine code. The journey from source to
            a running program is a multi-stage transformation, each step
            converting your intent into something closer to what the hardware
            can execute.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            The Four Stages
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            When you type <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">gcc hello.c -o hello</code>,
            the compiler driver orchestrates four distinct stages. Each stage
            reads a specific input format and produces a specific output format.
            Understanding this pipeline is essential to understanding how ELF
            binaries are structured.
          </p>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <PipelineDiagram />
          </div>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h3 className="text-xl font-bold text-white mb-3">
            Stage 1: Preprocessing
          </h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The preprocessor (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">cpp</code>)
            is a text-processing engine that runs before any actual compilation.
            It handles <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">#include</code> directives
            by literally pasting the contents of header files into your source.
            It expands <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">#define</code> macros,
            resolves <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">#ifdef</code> conditionals,
            and strips comments. A 20-line source file can easily expand to
            thousands of lines after preprocessing, because standard headers
            like <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">stdio.h</code> bring
            along an enormous amount of type definitions and declarations.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            You can see the preprocessor output yourself with{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">gcc -E hello.c -o hello.i</code>.
            The resulting <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.i</code> file
            is still valid C, but with every macro resolved and every header
            inlined.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h3 className="text-xl font-bold text-white mb-3">
            Stage 2: Compilation
          </h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The compiler proper (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">cc1</code>)
            takes the preprocessed C and transforms it into assembly language
            for your target architecture. This is where the heavy lifting
            happens: parsing, semantic analysis, optimization passes, and code
            generation. The compiler converts high-level constructs like loops,
            function calls, and pointer arithmetic into sequences of machine
            instructions expressed in human-readable assembly syntax.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            At this point, external function calls (like{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">printf</code>) remain
            as symbolic references. The compiler does not know where{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">printf</code> lives in
            memory; it just emits a <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">call printf</code> instruction
            and trusts that someone else will fill in the address later.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h3 className="text-xl font-bold text-white mb-3">
            Stage 3: Assembly
          </h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The assembler (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">as</code>)
            translates assembly mnemonics into actual machine code bytes. The
            instruction <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">mov $0x1, %eax</code> becomes
            the byte sequence <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">b8 01 00 00 00</code>.
            This is the stage that produces real machine code, the binary
            instructions that the CPU will ultimately execute.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            The output is an ELF object file (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.o</code>).
            It already has ELF structure with sections like{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.text</code> and{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.data</code>,
            but contains relocation entries where addresses need to be patched.
            The object file is not yet executable because external references
            are still unresolved.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.15}>
          <h3 className="text-xl font-bold text-white mb-3">
            Stage 4: Linking
          </h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The linker (<code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">ld</code>)
            is the final and most complex stage. It takes one or more object
            files, resolves all symbolic cross-references, and combines
            everything into a single executable. The linker merges{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.text</code> sections
            from multiple objects into one, resolves function calls between
            translation units, and assigns final virtual addresses.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            For dynamically linked executables, the linker also generates the
            PLT (Procedure Linkage Table) and GOT (Global Offset Table) stubs,
            creates the <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.interp</code> section
            that names the dynamic linker, and builds the{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.dynamic</code> section
            listing shared library dependencies. It also creates program
            headers that tell the OS kernel how to map the file into memory.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Callout variant="insight" title="The linker is where ELF takes shape">
            While the assembler produces the first ELF-formatted file (the{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.o</code> object file),
            it is the linker that constructs the full ELF executable with all
            its segments, dynamic linking infrastructure, and program headers.
            Every structural detail we explore in this course, from the ELF
            header to program headers to the PLT/GOT machinery, is the
            linker&apos;s handiwork.
          </Callout>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            Interactive Pipeline
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Click through each stage below to explore what happens at every
            step of the compilation process. Pay attention to how the file
            changes format and size at each stage, and note the sections that
            the linker adds in the final step.
          </p>
          <PipelineViewer />
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Quiz
            question="Which stage of the compilation pipeline produces machine code?"
            options={[
              {
                text: "Preprocessor",
                correct: false,
                explanation:
                  "The preprocessor only handles text substitution: macros, includes, and conditionals. Its output is still valid C source code.",
              },
              {
                text: "Compiler",
                correct: false,
                explanation:
                  "The compiler converts C to assembly language, which is human-readable text, not machine code bytes.",
              },
              {
                text: "Assembler",
                correct: true,
                explanation:
                  "The assembler translates assembly mnemonics into machine code bytes, producing an ELF object file (.o) with actual executable instructions.",
              },
              {
                text: "Linker",
                correct: false,
                explanation:
                  "The linker combines and relocates existing machine code from object files but does not generate new machine code from assembly.",
              },
            ]}
          />
        </ScrollSection>
      </div>
    </ChapterLayout>
  );
}
