"use client";

import { motion } from "framer-motion";
import type { Elf64Phdr } from "@/lib/elf/types";
import { P_TYPE, decodePhdrFlags } from "@/lib/elf/constants";
import { getSegmentColor } from "@/lib/colors";

interface DiskLayoutProps {
  programs: Elf64Phdr[];
  compressed: boolean;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  blockRefs: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
}

function formatSize(size: bigint): string {
  const n = Number(size);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MiB`;
}

function formatHex(value: bigint): string {
  return `0x${value.toString(16)}`;
}

export function DiskLayout({
  programs,
  compressed,
  hoveredIndex,
  onHover,
  blockRefs,
}: DiskLayoutProps) {
  const sorted = [...programs]
    .filter((p) => p.p_filesz > 0n)
    .sort((a, b) => Number(a.p_offset - b.p_offset));

  const maxFileSize = sorted.reduce(
    (max, p) => {
      const end = Number(p.p_offset + p.p_filesz);
      return end > max ? end : max;
    },
    0
  );

  function getHeight(p: Elf64Phdr): number {
    if (compressed) return 64;
    const ratio = Number(p.p_filesz) / maxFileSize;
    return Math.max(32, ratio * 400);
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
        File Layout (Disk)
      </h3>
      {sorted.map((phdr) => {
        const color = getSegmentColor(phdr.index);
        const isHovered = hoveredIndex === phdr.index;
        const height = getHeight(phdr);
        const typeName = P_TYPE[phdr.p_type] ?? `0x${phdr.p_type.toString(16)}`;
        const flags = decodePhdrFlags(phdr.p_flags);

        return (
          <motion.div
            key={phdr.index}
            ref={(el) => {
              blockRefs.current.set(phdr.index, el);
            }}
            className="relative rounded border cursor-pointer overflow-hidden"
            style={{
              height,
              borderColor: isHovered ? color : `${color}66`,
              backgroundColor: isHovered ? `${color}30` : `${color}15`,
            }}
            animate={{
              scale: isHovered ? 1.02 : 1,
              borderWidth: isHovered ? 2 : 1,
            }}
            transition={{ duration: 0.15 }}
            onMouseEnter={() => onHover(phdr.index)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="absolute inset-0 flex flex-col justify-center px-3 py-1">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold font-mono truncate"
                  style={{ color }}
                >
                  {typeName}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {flags}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] font-mono text-zinc-500">
                  {formatHex(phdr.p_offset)}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {formatSize(phdr.p_filesz)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
