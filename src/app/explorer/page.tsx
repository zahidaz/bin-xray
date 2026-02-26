"use client";

import { useState } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";
import { useUiStore } from "@/lib/store/ui-store";
import { useElf } from "@/lib/hooks/use-elf";
import { HexViewer } from "@/components/hex-viewer/HexViewer";
import { StructViewer } from "@/components/struct-viewer/StructViewer";
import { MemoryMap } from "@/components/memory-map/MemoryMap";
import { PltGotAnimator } from "@/components/plt-got/PltGotAnimator";
import { SectionSegmentToggle } from "@/components/section-segment/SectionSegmentToggle";
import { BinarySelector } from "@/components/shared/BinarySelector";
import { BinaryUploader } from "@/components/shared/BinaryUploader";
import {
  ELF64_EHDR_META,
  ELF64_PHDR_META,
  ELF64_SHDR_META,
  ELF64_SYM_META,
} from "@/config/structs";
import { decodeEhdr } from "@/lib/elf/decode";
import Link from "next/link";

type Tab = "hex" | "struct" | "memory" | "plt-got" | "sections";

type StructTarget =
  | { kind: "ehdr" }
  | { kind: "phdr"; index: number }
  | { kind: "shdr"; index: number }
  | { kind: "sym"; index: number };

export default function ExplorerPage() {
  const { elf, loading, error, fileName } = useElf("hello-dynamic.bin");
  const [activeTab, setActiveTab] = useState<Tab>("hex");
  const [structTarget, setStructTarget] = useState<StructTarget>({
    kind: "ehdr",
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "hex", label: "Hex Viewer" },
    { id: "struct", label: "Struct Viewer" },
    { id: "memory", label: "Memory Map" },
    { id: "plt-got", label: "PLT/GOT" },
    { id: "sections", label: "Sections/Segments" },
  ];

  const getStructProps = () => {
    if (!elf) return null;
    switch (structTarget.kind) {
      case "ehdr":
        return { struct: ELF64_EHDR_META, baseOffset: 0 };
      case "phdr":
        return {
          struct: ELF64_PHDR_META,
          baseOffset: Number(elf.header.e_phoff),
          entryIndex: structTarget.index,
        };
      case "shdr":
        return {
          struct: ELF64_SHDR_META,
          baseOffset: Number(elf.header.e_shoff),
          entryIndex: structTarget.index,
        };
      case "sym":
        return {
          struct: ELF64_SYM_META,
          baseOffset: 0,
          entryIndex: structTarget.index,
        };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            BinXray
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            Full Explorer
            {fileName && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-400 font-mono">
                {fileName}
              </span>
            )}
          </div>
          <Link
            href="/jargon"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Jargon
          </Link>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto w-full px-4 py-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Sample Binaries
            </h2>
            <BinarySelector />
          </div>
          <div className="lg:w-80">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Upload Your Own
            </h2>
            <BinaryUploader />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {elf && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Type:</span>{" "}
                  <span className="text-zinc-200">
                    {decodeEhdr(elf.header).type}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Machine:</span>{" "}
                  <span className="text-zinc-200">
                    {decodeEhdr(elf.header).machine}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Entry:</span>{" "}
                  <span className="text-zinc-200 font-mono">
                    {decodeEhdr(elf.header).entry}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Size:</span>{" "}
                  <span className="text-zinc-200">
                    {elf.raw.byteLength.toLocaleString()} bytes
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-4 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[600px]">
              {activeTab === "hex" && <HexViewer />}

              {activeTab === "struct" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStructTarget({ kind: "ehdr" })}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        structTarget.kind === "ehdr"
                          ? "bg-purple-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      ELF Header
                    </button>
                    {elf.programs.map((_, i) => (
                      <button
                        key={`phdr-${i}`}
                        onClick={() =>
                          setStructTarget({ kind: "phdr", index: i })
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          structTarget.kind === "phdr" &&
                          structTarget.index === i
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Phdr[{i}]
                      </button>
                    ))}
                    {elf.sections.map((s, i) => (
                      <button
                        key={`shdr-${i}`}
                        onClick={() =>
                          setStructTarget({ kind: "shdr", index: i })
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          structTarget.kind === "shdr" &&
                          structTarget.index === i
                            ? "bg-cyan-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {s.resolvedName || `[${i}]`}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const props = getStructProps();
                    if (!props) return null;
                    return (
                      <StructViewer
                        struct={props.struct}
                        baseOffset={props.baseOffset}
                        entryIndex={props.entryIndex}
                      />
                    );
                  })()}
                </div>
              )}

              {activeTab === "memory" && <MemoryMap />}
              {activeTab === "plt-got" && <PltGotAnimator />}
              {activeTab === "sections" && <SectionSegmentToggle />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
