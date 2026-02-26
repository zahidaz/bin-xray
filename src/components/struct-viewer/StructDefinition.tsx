"use client";

import type { StructMeta, StructFieldMeta } from "@/lib/elf/types";

interface StructDefinitionProps {
  struct: StructMeta;
  hoveredField: string | null;
}

const TYPE_MAP: Record<StructFieldMeta["type"], string> = {
  u8: "uint8_t",
  u16: "uint16_t",
  u32: "uint32_t",
  u64: "uint64_t",
  bytes: "unsigned char",
};

function fieldToCType(field: StructFieldMeta): string {
  const base = TYPE_MAP[field.type];
  if (field.type === "bytes") {
    return `${base} ${field.name}[${field.size}]`;
  }
  return `${base} ${field.name}`;
}

export function StructDefinition({ struct, hoveredField }: StructDefinitionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="font-mono text-sm font-semibold text-zinc-200">
          {struct.name}
        </span>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          {struct.size} bytes
        </span>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-sm leading-relaxed">
          <span className="text-blue-400">typedef</span>
          <span className="text-zinc-400">{" "}</span>
          <span className="text-blue-400">struct</span>
          <span className="text-zinc-400">{" {"}</span>
          {"\n"}
          {struct.fields.map((field) => {
            const isActive = hoveredField === field.name;
            return (
              <span
                key={field.name}
                className={`block transition-colors ${
                  isActive ? "bg-violet-500/15" : ""
                }`}
              >
                <span className="text-zinc-600">{"    "}</span>
                <span className={isActive ? "text-green-300" : "text-green-400"}>
                  {fieldToCType(field)}
                </span>
                <span className="text-zinc-400">;</span>
                {"\n"}
              </span>
            );
          })}
          <span className="text-zinc-400">{"} "}</span>
          <span className="text-yellow-300">{struct.name}</span>
          <span className="text-zinc-400">;</span>
        </pre>
      </div>
    </div>
  );
}
