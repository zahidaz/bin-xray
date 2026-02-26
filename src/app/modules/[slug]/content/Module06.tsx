"use client";

import { useEffect } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";
import { ChapterLayout } from "@/components/narrative/ChapterLayout";
import { ScrollSection } from "@/components/narrative/ScrollSection";
import { Callout } from "@/components/narrative/Callout";
import { Quiz } from "@/components/narrative/Quiz";
import { PltGotAnimator } from "@/components/plt-got/PltGotAnimator";

export default function Module06() {
  const loadSample = useBinaryStore((s) => s.loadSample);

  useEffect(() => {
    loadSample("hello-dynamic.bin");
  }, [loadSample]);

  return (
    <ChapterLayout
      title="Dynamic Linking"
      moduleNumber={6}
      prevSlug="05-segments-and-loading"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <ScrollSection>
          <p className="text-zinc-300 text-lg leading-relaxed">
            Dynamic linking is the mechanism that lets multiple programs share the same library
            code at runtime. Instead of embedding a copy of{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">printf</code> in
            every binary, the linker leaves a placeholder that gets resolved when the program runs.
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">Why Shared Libraries?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-green-400 mb-2">Code Sharing</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                One copy of libc in memory serves every running program. Hundreds of processes
                can share the same physical pages of library code.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-blue-400 mb-2">Smaller Binaries</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Executables only contain their own code. A dynamically-linked hello world is
                often 10-100x smaller than its statically-linked counterpart.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-purple-400 mb-2">Easy Updates</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Fixing a bug in a shared library instantly benefits every program that uses it,
                without recompilation.
              </p>
            </div>
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">PLT and GOT &mdash; The Indirection Mechanism</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Two data structures work together to make dynamic linking possible:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-mono text-sm font-bold text-pink-400 mb-2">
                PLT (Procedure Linkage Table)
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A table of small code stubs, one per external function. When your code calls{" "}
                <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
                  printf
                </code>
                , it actually calls{" "}
                <code className="text-blue-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">
                  printf@plt
                </code>
                , which is a trampoline that reads the GOT to find the real address.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-mono text-sm font-bold text-cyan-400 mb-2">
                GOT (Global Offset Table)
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A writable table of function addresses. Initially, each entry points back into
                the PLT. After resolution, it holds the real address of the function in the
                shared library.
              </p>
            </div>
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-6">Lazy Binding in Action</h2>
          <PltGotAnimator />
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">The 5-Step Resolution Process</h2>
          <div className="space-y-3 mb-6">
            {[
              {
                step: 1,
                label: "call printf@plt",
                desc: "Your code calls the PLT stub instead of the real function.",
                color: "text-blue-400",
              },
              {
                step: 2,
                label: "PLT reads GOT (points back to PLT initially)",
                desc: "The PLT stub does an indirect jump through the GOT. On first call, the GOT entry points back to the next PLT instruction.",
                color: "text-pink-400",
              },
              {
                step: 3,
                label: "Push relocation index, jump to resolver",
                desc: "The PLT pushes a relocation index and jumps to PLT[0], which calls the dynamic linker's resolver.",
                color: "text-purple-400",
              },
              {
                step: 4,
                label: "Resolver patches GOT with real address",
                desc: "The dynamic linker looks up printf in libc, finds its address, and overwrites the GOT entry.",
                color: "text-green-400",
              },
              {
                step: 5,
                label: "Second call goes directly through GOT",
                desc: "Now the GOT entry holds the real address. The PLT stub jumps straight to libc's printf, bypassing the resolver.",
                color: "text-cyan-400",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-sm font-bold ${item.color}`}>
                  {item.step}
                </div>
                <div>
                  <div className={`font-mono text-sm font-bold ${item.color} mb-1`}>
                    {item.label}
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Callout variant="insight" title="Lazy Binding">
            Lazy binding is a performance optimization. Only resolve symbols that are actually
            called. A program might link against hundreds of functions but only use a handful
            in any given run. Lazy binding means startup isn&apos;t penalized by resolving every
            symbol upfront.
          </Callout>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            .dynamic &mdash; Library Dependencies
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            The <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.dynamic</code> section
            is an array of tag-value pairs that tell the dynamic linker everything it needs. Key entries
            include:
          </p>
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 mb-4">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900">
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Tag
                  </th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-400">DT_NEEDED</td>
                  <td className="px-4 py-2 text-sm text-zinc-400">Shared library dependency (e.g., libc.so.6)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-400">DT_STRTAB</td>
                  <td className="px-4 py-2 text-sm text-zinc-400">Address of the dynamic string table</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-400">DT_SYMTAB</td>
                  <td className="px-4 py-2 text-sm text-zinc-400">Address of the dynamic symbol table</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-400">DT_PLTGOT</td>
                  <td className="px-4 py-2 text-sm text-zinc-400">Address of the GOT</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-mono text-blue-400">DT_JMPREL</td>
                  <td className="px-4 py-2 text-sm text-zinc-400">Address of PLT relocation entries</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <h2 className="text-2xl font-bold text-white mb-4">
            .rela.plt and .rela.dyn &mdash; Relocation Entries
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Relocation entries tell the dynamic linker which GOT slots to patch and how.{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.rela.plt</code> handles
            function calls through the PLT (R_X86_64_JUMP_SLOT), while{" "}
            <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded">.rela.dyn</code> handles
            data references like global variable addresses (R_X86_64_GLOB_DAT).
          </p>
        </ScrollSection>

        <ScrollSection delay={0.1}>
          <Quiz
            question="After lazy resolution, what does the GOT entry contain?"
            options={[
              {
                text: "A pointer back to the PLT stub",
                correct: false,
                explanation:
                  "That's the initial state before resolution. The PLT stub points back to itself only to trigger the resolver on first call.",
              },
              {
                text: "The relocation index for the symbol",
                correct: false,
                explanation:
                  "The relocation index is pushed onto the stack during resolution but is not stored in the GOT.",
              },
              {
                text: "The real address of the function in the shared library",
                correct: true,
                explanation:
                  "Correct! After the dynamic linker resolves the symbol, it patches the GOT entry with the actual runtime address of the function (e.g., printf's address in libc). Subsequent calls jump directly to the real function.",
              },
              {
                text: "The address of the dynamic linker's resolver",
                correct: false,
                explanation:
                  "The resolver's address is stored in GOT[2], not in function-specific GOT entries.",
              },
            ]}
          />
        </ScrollSection>
      </div>
    </ChapterLayout>
  );
}
