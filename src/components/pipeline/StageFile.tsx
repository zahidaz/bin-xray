"use client";

import { motion } from "framer-motion";

interface StageFileProps {
  name: string;
  extension: string;
  size: string;
  previousSize?: string;
  onClick: () => void;
}

function FileIcon({ extension }: { extension: string }) {
  const colorMap: Record<string, string> = {
    ".c": "#3b82f6",
    ".i": "#06b6d4",
    ".s": "#f97316",
    ".o": "#8b5cf6",
    "": "#ef4444",
  };
  const color = colorMap[extension] ?? "#71717a";

  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
      <path
        d="M2 4a2 2 0 012-2h10l8 8v14a2 2 0 01-2 2H4a2 2 0 01-2-2V4z"
        fill={`${color}22`}
        stroke={color}
        strokeWidth="1.5"
      />
      <path d="M14 2v6a2 2 0 002 2h6" stroke={color} strokeWidth="1.5" />
      <text
        x="12"
        y="20"
        textAnchor="middle"
        fill={color}
        fontSize="7"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {extension || "ELF"}
      </text>
    </svg>
  );
}

function computeGrowth(current: string, previous?: string): string | null {
  if (!previous) return null;
  const parse = (s: string): number => {
    const match = s.match(/([\d.]+)\s*(B|KiB|MiB)/);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    if (match[2] === "KiB") return val * 1024;
    if (match[2] === "MiB") return val * 1024 * 1024;
    return val;
  };
  const curr = parse(current);
  const prev = parse(previous);
  if (prev === 0) return null;
  const ratio = curr / prev;
  if (ratio > 1) return `${ratio.toFixed(1)}x`;
  return null;
}

export function StageFile({
  name,
  extension,
  size,
  previousSize,
  onClick,
}: StageFileProps) {
  const growth = computeGrowth(size, previousSize);

  return (
    <motion.button
      className="flex items-center gap-3 w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-colors text-left"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <FileIcon extension={extension} />
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-mono text-zinc-200 truncate">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">{size}</span>
          {growth && (
            <span className="text-[10px] font-bold text-amber-400">
              {growth}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
