"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STEPS = [
  {
    label: "$ ./hello",
    description: "You type a command in your shell",
    module: null,
  },
  {
    label: "execve()",
    description: "The shell calls execve — the kernel takes over",
    module: "05-segments-and-loading",
  },
  {
    label: "Read ELF Header",
    description: "The kernel reads the first 64 bytes: magic number, type, architecture",
    module: "02-elf-header",
  },
  {
    label: "Parse Program Headers",
    description: "Segments tell the kernel what to map into memory and where",
    module: "03-sections-vs-segments",
  },
  {
    label: "Map Memory",
    description: "PT_LOAD segments are mapped at their virtual addresses with correct permissions",
    module: "05-segments-and-loading",
  },
  {
    label: "Dynamic Linker",
    description: "If PT_INTERP exists, ld-linux.so resolves shared library symbols",
    module: "06-dynamic-linking",
  },
  {
    label: "Jump to Entry",
    description: "CPU starts executing at e_entry — your program runs",
    module: "02-elf-header",
  },
];

const MODULES = [
  { slug: "01-compilation-pipeline", title: "From Source to Binary", number: 1 },
  { slug: "02-elf-header", title: "The ELF Header", number: 2 },
  { slug: "03-sections-vs-segments", title: "Sections vs Segments", number: 3 },
  { slug: "04-sections-deep-dive", title: "Sections Deep Dive", number: 4 },
  { slug: "05-segments-and-loading", title: "Segments and Loading", number: 5 },
  { slug: "06-dynamic-linking", title: "Dynamic Linking", number: 6 },
  { slug: "07-full-explorer", title: "Full Explorer", number: 7 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Interactive Binary Format Explorer
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Bin<span className="text-blue-400">Xray</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
              See through your binaries. Explore hex dumps, struct layouts,
              memory maps, and dynamic linking — interactively.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                href="/modules/01-compilation-pipeline"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
              >
                Start Learning
              </Link>
              <Link
                href="/explorer"
                className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                Open Explorer
              </Link>
              <Link
                href="/jargon"
                className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                Jargon Reference
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            What happens when you run <code className="text-blue-400">./hello</code>?
          </h2>
          <p className="text-zinc-500 text-center mb-12">
            Every step is a doorway into a deeper concept. Click to explore.
          </p>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent" />

            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-zinc-900 border-2 border-blue-500 z-10" />

                  {step.module ? (
                    <Link
                      href={`/modules/${step.module}`}
                      className="block p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <code className="text-blue-400 font-mono text-sm font-bold group-hover:text-blue-300">
                          {step.label}
                        </code>
                        <span className="text-xs text-zinc-600">→</span>
                      </div>
                      <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                        {step.description}
                      </p>
                    </Link>
                  ) : (
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <code className="text-green-400 font-mono text-sm font-bold">
                        {step.label}
                      </code>
                      <p className="text-sm text-zinc-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
            >
              <Link
                href={mod.slug === "07-full-explorer" ? "/explorer" : `/modules/${mod.slug}`}
                className="block p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-bold">
                    {mod.number}
                  </span>
                  <span className="text-zinc-200 font-medium group-hover:text-white">
                    {mod.title}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-800 text-center">
        <p className="text-sm text-zinc-600">
          BinXray — See through your binaries
        </p>
      </footer>
    </div>
  );
}
