"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Elf64Shdr, Elf64Phdr } from "@/lib/elf/types";
import { getRegionColor, getSegmentColor } from "@/lib/colors";
import { P_TYPE, decodePhdrFlags } from "@/lib/elf/constants";
import { sectionNameToRegionType } from "@/lib/elf/regions";
import type { ViewMode } from "@/lib/store/ui-store";

interface ByteMapProps {
  sections: Elf64Shdr[];
  programs: Elf64Phdr[];
  fileSize: number;
  viewMode: ViewMode;
  onOffsetClick: (offset: number) => void;
  onRegionHover: (info: { name: string; offset: number; size: number } | null) => void;
}

interface Block {
  name: string;
  offset: number;
  size: number;
  color: string;
  pct: number;
  flags?: string;
}

const MIN_HEIGHT = 28;
const TOTAL_HEIGHT = 500;

export function ByteMap({
  sections,
  programs,
  fileSize,
  viewMode,
  onOffsetClick,
  onRegionHover,
}: ByteMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const sectionBlocks: Block[] = useMemo(() => {
    const sorted = [...sections]
      .filter((s) => s.sh_size > 0n && Number(s.sh_offset) > 0)
      .sort((a, b) => Number(a.sh_offset - b.sh_offset));

    const blocks: Block[] = [];
    let prevEnd = 0;

    for (const s of sorted) {
      const offset = Number(s.sh_offset);
      const size = Number(s.sh_size);

      if (offset > prevEnd) {
        blocks.push({
          name: `gap`,
          offset: prevEnd,
          size: offset - prevEnd,
          color: "#27272a",
          pct: ((offset - prevEnd) / fileSize) * 100,
        });
      }

      const regionType = sectionNameToRegionType(s.resolvedName);
      blocks.push({
        name: s.resolvedName || `[${s.index}]`,
        offset,
        size,
        color: getRegionColor(regionType).hex,
        pct: (size / fileSize) * 100,
      });
      prevEnd = offset + size;
    }

    if (prevEnd < fileSize) {
      blocks.push({
        name: "gap",
        offset: prevEnd,
        size: fileSize - prevEnd,
        color: "#27272a",
        pct: ((fileSize - prevEnd) / fileSize) * 100,
      });
    }

    return blocks;
  }, [sections, fileSize]);

  const segmentBlocks: Block[] = useMemo(() => {
    const sorted = [...programs]
      .filter((p) => p.p_filesz > 0n)
      .sort((a, b) => Number(a.p_offset - b.p_offset));

    const blocks: Block[] = [];
    let prevEnd = 0;

    for (const p of sorted) {
      const offset = Number(p.p_offset);
      const size = Number(p.p_filesz);

      if (offset > prevEnd) {
        blocks.push({
          name: "gap",
          offset: prevEnd,
          size: offset - prevEnd,
          color: "#27272a",
          pct: ((offset - prevEnd) / fileSize) * 100,
        });
      }

      blocks.push({
        name: P_TYPE[p.p_type] ?? `segment[${p.index}]`,
        offset,
        size,
        color: getSegmentColor(p.index),
        pct: (size / fileSize) * 100,
        flags: decodePhdrFlags(p.p_flags),
      });
      prevEnd = offset + size;
    }

    if (prevEnd < fileSize) {
      blocks.push({
        name: "gap",
        offset: prevEnd,
        size: fileSize - prevEnd,
        color: "#27272a",
        pct: ((fileSize - prevEnd) / fileSize) * 100,
      });
    }

    return blocks;
  }, [programs, fileSize]);

  const blocks = viewMode === "sections" ? sectionBlocks : segmentBlocks;

  const totalNonGap = blocks.filter((b) => b.name !== "gap").reduce((s, b) => s + b.size, 0);
  const displayBlocks = blocks.map((b) => {
    if (b.name === "gap") {
      return { ...b, height: Math.max(4, (b.size / fileSize) * TOTAL_HEIGHT) };
    }
    const rawH = (b.size / totalNonGap) * (TOTAL_HEIGHT * 0.85);
    return { ...b, height: Math.max(MIN_HEIGHT, rawH) };
  });

  const totalH = displayBlocks.reduce((s, b) => s + b.height, 0);

  return (
    <div className="flex flex-col" style={{ minHeight: TOTAL_HEIGHT }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[10px] font-mono text-zinc-500">0x00000000</div>
        <div className="flex-1 h-px bg-zinc-700" />
        <div className="text-[10px] font-mono text-zinc-500">{fileSize} bytes</div>
      </div>

      <div
        className="relative rounded-lg overflow-hidden border border-zinc-700"
        style={{ height: totalH }}
      >
        {displayBlocks.map((block, i) => {
          const top = displayBlocks.slice(0, i).reduce((s, b) => s + b.height, 0);
          const isGap = block.name === "gap";
          const isHovered = hovered === `${block.name}-${block.offset}`;

          return (
            <motion.div
              key={`${block.name}-${block.offset}`}
              className={`absolute left-0 right-0 flex items-center transition-all ${
                isGap ? "cursor-default" : "cursor-pointer"
              }`}
              style={{
                top,
                height: block.height,
                backgroundColor: isGap
                  ? "#18181b"
                  : isHovered
                    ? block.color + "50"
                    : block.color + "30",
                borderBottom: "1px solid #27272a",
              }}
              onMouseEnter={() => {
                if (!isGap) {
                  setHovered(`${block.name}-${block.offset}`);
                  onRegionHover({
                    name: block.name,
                    offset: block.offset,
                    size: block.size,
                  });
                }
              }}
              onMouseLeave={() => {
                setHovered(null);
                onRegionHover(null);
              }}
              onClick={() => {
                if (!isGap) onOffsetClick(block.offset);
              }}
            >
              {!isGap && block.height >= MIN_HEIGHT && (
                <div className="flex items-center gap-2 px-3 w-full min-w-0">
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: block.color }}
                  />
                  <span className="text-xs font-mono text-zinc-200 truncate">
                    {block.name}
                  </span>
                  {block.flags && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 shrink-0">
                      {block.flags}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-zinc-500 ml-auto shrink-0">
                    0x{block.offset.toString(16)} &middot; {block.size}B
                  </span>
                </div>
              )}
              {isGap && block.height >= 12 && (
                <div className="px-3">
                  <span className="text-[10px] text-zinc-600 italic">
                    {block.size}B unmapped
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs"
          >
            {(() => {
              const block = displayBlocks.find(
                (b) => `${b.name}-${b.offset}` === hovered
              );
              if (!block) return null;
              return (
                <div className="flex items-center gap-4">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: block.color }}
                  />
                  <span className="font-mono font-bold text-zinc-200">
                    {block.name}
                  </span>
                  <span className="text-zinc-400">
                    Offset: <span className="text-zinc-300 font-mono">0x{block.offset.toString(16)}</span>
                  </span>
                  <span className="text-zinc-400">
                    Size: <span className="text-zinc-300 font-mono">{block.size} bytes</span>
                  </span>
                  <span className="text-zinc-400">
                    {block.pct.toFixed(1)}% of file
                  </span>
                  {block.flags && (
                    <span className="text-zinc-400">
                      Flags: <span className="text-zinc-300 font-mono">{block.flags}</span>
                    </span>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
