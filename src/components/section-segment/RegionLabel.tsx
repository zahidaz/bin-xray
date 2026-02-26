"use client";

import { motion } from "framer-motion";

interface RegionLabelProps {
  name: string;
  size: number;
  color: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MiB`;
}

export function RegionLabel({
  name,
  size,
  color,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: RegionLabelProps) {
  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors"
      style={{
        backgroundColor: isHovered ? `${color}25` : "transparent",
      }}
      animate={{ x: isHovered ? 4 : 0 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        className="w-2 h-2 rounded-sm shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono text-zinc-300 truncate">
        {name}
      </span>
      <span className="text-[10px] font-mono text-zinc-500 ml-auto shrink-0">
        {formatSize(size)}
      </span>
    </motion.div>
  );
}
