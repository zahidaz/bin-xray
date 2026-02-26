"use client";

import { motion } from "framer-motion";
import type { Elf64Phdr } from "@/lib/elf/types";
import { P_TYPE, PF_R, PF_W, PF_X } from "@/lib/elf/constants";
import { getSegmentColor } from "@/lib/colors";

interface MemoryLayoutProps {
  programs: Elf64Phdr[];
  compressed: boolean;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  blockRefs: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
}

function formatAddr(value: bigint): string {
  return `0x${value.toString(16).padStart(12, "0")}`;
}

function formatSize(size: bigint): string {
  const n = Number(size);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MiB`;
}

function PermBadge({ flags }: { flags: number }) {
  const perms = [
    { flag: PF_R, label: "R", color: "bg-green-500/30 text-green-300" },
    { flag: PF_W, label: "W", color: "bg-yellow-500/30 text-yellow-300" },
    { flag: PF_X, label: "X", color: "bg-red-500/30 text-red-300" },
  ];

  return (
    <div className="flex gap-0.5">
      {perms.map(({ flag, label, color }) => (
        <span
          key={label}
          className={`text-[9px] font-bold px-1 rounded ${
            flags & flag ? color : "bg-zinc-800 text-zinc-600"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function MemoryLayout({
  programs,
  compressed,
  hoveredIndex,
  onHover,
  blockRefs,
}: MemoryLayoutProps) {
  const loadable = [...programs]
    .filter((p) => p.p_memsz > 0n)
    .sort((a, b) => Number(a.p_vaddr - b.p_vaddr));

  const maxMemSize = loadable.reduce(
    (max, p) => {
      const end = Number(p.p_vaddr + p.p_memsz);
      return end > max ? end : max;
    },
    0
  );
  const minAddr = loadable.length > 0 ? Number(loadable[0].p_vaddr) : 0;
  const range = maxMemSize - minAddr;

  function getHeight(p: Elf64Phdr): number {
    if (compressed) return 64;
    const ratio = Number(p.p_memsz) / range;
    return Math.max(32, ratio * 400);
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
        Virtual Memory
      </h3>
      {loadable.map((phdr) => {
        const color = getSegmentColor(phdr.index);
        const isHovered = hoveredIndex === phdr.index;
        const height = getHeight(phdr);
        const hasBss = phdr.p_memsz > phdr.p_filesz;
        const bssRatio =
          hasBss
            ? Number(phdr.p_memsz - phdr.p_filesz) / Number(phdr.p_memsz)
            : 0;
        const typeName = P_TYPE[phdr.p_type] ?? `0x${phdr.p_type.toString(16)}`;

        return (
          <motion.div
            key={phdr.index}
            ref={(el) => {
              blockRefs.current.set(phdr.index, el);
            }}
            className="relative rounded overflow-hidden cursor-pointer"
            style={{ height }}
            animate={{
              scale: isHovered ? 1.02 : 1,
            }}
            transition={{ duration: 0.15 }}
            onMouseEnter={() => onHover(phdr.index)}
            onMouseLeave={() => onHover(null)}
          >
            <div
              className="absolute inset-0 rounded border"
              style={{
                borderColor: isHovered ? color : `${color}66`,
                backgroundColor: isHovered ? `${color}30` : `${color}15`,
              }}
            />
            {hasBss && (
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b border-t-2 border-dashed"
                style={{
                  height: `${bssRatio * 100}%`,
                  borderColor: `${color}88`,
                  backgroundColor: `${color}08`,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-zinc-500">
                  BSS ({formatSize(phdr.p_memsz - phdr.p_filesz)})
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-center px-3 py-1 z-10">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold font-mono truncate"
                  style={{ color }}
                >
                  {typeName}
                </span>
                <PermBadge flags={phdr.p_flags} />
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] font-mono text-zinc-500">
                  {formatAddr(phdr.p_vaddr)}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {formatSize(phdr.p_memsz)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
