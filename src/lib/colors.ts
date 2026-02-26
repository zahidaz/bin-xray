import type { RegionType } from "./elf/types";

export const REGION_COLORS: Record<RegionType, { bg: string; text: string; hex: string }> = {
  "elf-header":     { bg: "bg-purple-500/20",  text: "text-purple-400",  hex: "#a855f7" },
  "program-header": { bg: "bg-blue-500/20",    text: "text-blue-400",    hex: "#3b82f6" },
  "section-header": { bg: "bg-cyan-500/20",    text: "text-cyan-400",    hex: "#06b6d4" },
  "text":           { bg: "bg-red-500/20",      text: "text-red-400",     hex: "#ef4444" },
  "data":           { bg: "bg-orange-500/20",   text: "text-orange-400",  hex: "#f97316" },
  "rodata":         { bg: "bg-yellow-500/20",   text: "text-yellow-400",  hex: "#eab308" },
  "bss":            { bg: "bg-orange-300/20",   text: "text-orange-300",  hex: "#fdba74" },
  "symtab":         { bg: "bg-green-500/20",    text: "text-green-400",   hex: "#22c55e" },
  "strtab":         { bg: "bg-emerald-500/20",  text: "text-emerald-400", hex: "#10b981" },
  "dynsym":         { bg: "bg-teal-500/20",     text: "text-teal-400",    hex: "#14b8a6" },
  "dynstr":         { bg: "bg-teal-300/20",     text: "text-teal-300",    hex: "#5eead4" },
  "dynamic":        { bg: "bg-indigo-500/20",   text: "text-indigo-400",  hex: "#6366f1" },
  "plt":            { bg: "bg-pink-500/20",     text: "text-pink-400",    hex: "#ec4899" },
  "got":            { bg: "bg-rose-500/20",     text: "text-rose-400",    hex: "#f43f5e" },
  "got-plt":        { bg: "bg-rose-400/20",     text: "text-rose-300",    hex: "#fb7185" },
  "rela-plt":       { bg: "bg-fuchsia-500/20",  text: "text-fuchsia-400", hex: "#d946ef" },
  "rela-dyn":       { bg: "bg-fuchsia-300/20",  text: "text-fuchsia-300", hex: "#f0abfc" },
  "interp":         { bg: "bg-sky-500/20",      text: "text-sky-400",     hex: "#0ea5e9" },
  "note":           { bg: "bg-slate-500/20",    text: "text-slate-400",   hex: "#64748b" },
  "shstrtab":       { bg: "bg-lime-500/20",     text: "text-lime-400",    hex: "#84cc16" },
  "init":           { bg: "bg-amber-500/20",    text: "text-amber-400",   hex: "#f59e0b" },
  "fini":           { bg: "bg-amber-300/20",    text: "text-amber-300",   hex: "#fcd34d" },
  "hash":           { bg: "bg-violet-500/20",   text: "text-violet-400",  hex: "#8b5cf6" },
  "gnu-hash":       { bg: "bg-violet-300/20",   text: "text-violet-300",  hex: "#c4b5fd" },
  "eh-frame":       { bg: "bg-stone-500/20",    text: "text-stone-400",   hex: "#78716c" },
  "eh-frame-hdr":   { bg: "bg-stone-400/20",    text: "text-stone-300",   hex: "#a8a29e" },
  "comment":        { bg: "bg-gray-500/20",     text: "text-gray-400",    hex: "#6b7280" },
  "init-array":     { bg: "bg-amber-600/20",    text: "text-amber-500",   hex: "#d97706" },
  "fini-array":     { bg: "bg-amber-400/20",    text: "text-amber-200",   hex: "#fbbf24" },
  "unknown":        { bg: "bg-zinc-500/20",     text: "text-zinc-400",    hex: "#71717a" },
};

export const SEGMENT_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#06b6d4",
  "#f43f5e",
];

export function getRegionColor(type: RegionType) {
  return REGION_COLORS[type] ?? REGION_COLORS.unknown;
}

export function getSegmentColor(index: number): string {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
}
