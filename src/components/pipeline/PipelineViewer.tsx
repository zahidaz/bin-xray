"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StageColumn } from "./StageColumn";
import { useUiStore } from "@/lib/store/ui-store";

interface PipelineStage {
  name: string;
  description: string;
  tool: string;
  fileName: string;
  fileExtension: string;
  fileSize: string;
  additions?: string[];
}

const STAGES: PipelineStage[] = [
  {
    name: "Source",
    description: "Human-readable C/C++ source code with preprocessor directives",
    tool: "editor",
    fileName: "main.c",
    fileExtension: ".c",
    fileSize: "342 B",
  },
  {
    name: "Preprocessed",
    description: "Macros expanded, headers included, conditionals resolved",
    tool: "cpp (preprocessor)",
    fileName: "main.i",
    fileExtension: ".i",
    fileSize: "18.2 KiB",
  },
  {
    name: "Assembly",
    description: "Architecture-specific assembly instructions, human readable",
    tool: "cc1 (compiler)",
    fileName: "main.s",
    fileExtension: ".s",
    fileSize: "1.4 KiB",
  },
  {
    name: "Object",
    description: "Machine code with relocations, not yet linked",
    tool: "as (assembler)",
    fileName: "main.o",
    fileExtension: ".o",
    fileSize: "2.8 KiB",
  },
  {
    name: "Executable",
    description: "Fully linked ELF binary with all segments and runtime support",
    tool: "ld (linker)",
    fileName: "main",
    fileExtension: "",
    fileSize: "16.4 KiB",
    additions: [".plt", ".got.plt", ".interp", ".dynamic", ".dynsym", ".rela.plt"],
  },
];

const STAGE_DETAILS: Record<number, { title: string; points: string[] }> = {
  0: {
    title: "Source Code",
    points: [
      "Written by the programmer in C, C++, or other languages",
      "Contains #include, #define, and other preprocessor directives",
      "May reference external library functions like printf",
    ],
  },
  1: {
    title: "Preprocessing (cpp)",
    points: [
      "All #include directives replaced with header file contents",
      "Macros expanded to their definitions",
      "Conditional compilation (#ifdef) resolved",
      "File typically grows 50-100x due to header expansion",
    ],
  },
  2: {
    title: "Compilation (cc1)",
    points: [
      "Converts C code to architecture-specific assembly",
      "Performs optimization passes (-O1, -O2, -O3)",
      "Generates AT&T or Intel syntax assembly",
      "Function calls to external symbols left as symbolic references",
    ],
  },
  3: {
    title: "Assembly (as)",
    points: [
      "Converts assembly mnemonics to machine code bytes",
      "Creates ELF object file (.o) with relocatable code",
      "Generates relocation entries for unresolved symbols",
      "Symbol table contains local and undefined symbols",
    ],
  },
  4: {
    title: "Linking (ld)",
    points: [
      "Combines object files and resolves symbol references",
      "Adds PLT/GOT stubs for dynamic library functions",
      "Creates .interp section pointing to dynamic linker",
      "Builds .dynamic section with library dependencies",
      "Sets up program headers for memory mapping",
      "Assigns final virtual addresses to all sections",
    ],
  },
};

export function PipelineViewer() {
  const [activeStage, setActiveStage] = useState(0);
  const setSelectedOffset = useUiStore((s) => s.setSelectedOffset);

  const handleFileClick = (index: number) => {
    setSelectedOffset(0);
    setActiveStage(index);
  };

  const detail = STAGE_DETAILS[activeStage];

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
      <h2 className="text-lg font-bold text-zinc-100">
        Compilation Pipeline
      </h2>

      <div className="flex items-start">
        {STAGES.map((stage, i) => (
          <StageColumn
            key={i}
            index={i}
            name={stage.name}
            description={stage.description}
            tool={stage.tool}
            fileName={stage.fileName}
            fileExtension={stage.fileExtension}
            fileSize={stage.fileSize}
            previousSize={i > 0 ? STAGES[i - 1].fileSize : undefined}
            isActive={activeStage === i}
            isLast={i === STAGES.length - 1}
            additions={stage.additions}
            onStageClick={setActiveStage}
            onFileClick={handleFileClick}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm font-bold text-zinc-200 mb-3">
            {detail.title}
          </h3>
          <ul className="space-y-1.5">
            {detail.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                <span className="text-blue-500 mt-0.5 shrink-0">&#x2022;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
