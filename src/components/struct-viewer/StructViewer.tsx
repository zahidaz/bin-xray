"use client";

import { useMemo } from "react";
import type { StructMeta } from "@/lib/elf/types";
import { useBinaryStore } from "@/lib/store/binary-store";
import { useUiStore } from "@/lib/store/ui-store";
import { useStructHighlight } from "@/lib/hooks/use-struct-highlight";
import { StructDefinition } from "./StructDefinition";
import { StructField } from "./StructField";

interface StructViewerProps {
  struct: StructMeta;
  baseOffset: number;
  entryIndex?: number;
  label?: string;
}

export function StructViewer({
  struct,
  baseOffset,
  entryIndex,
  label,
}: StructViewerProps) {
  const raw = useBinaryStore((s) => s.raw);
  const hoveredField = useUiStore((s) => s.hoveredField);

  const effectiveOffset = useMemo(() => {
    if (entryIndex !== undefined) {
      return baseOffset + entryIndex * struct.size;
    }
    return baseOffset;
  }, [baseOffset, entryIndex, struct.size]);

  const { onFieldHover, onFieldClick } = useStructHighlight(effectiveOffset);

  if (!raw) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-8">
        <span className="text-sm text-zinc-500">No binary loaded</span>
      </div>
    );
  }

  const title = label
    ?? (entryIndex !== undefined
      ? `${struct.name}[${entryIndex}]`
      : struct.name);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="font-mono text-lg font-bold text-zinc-100">{title}</h3>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          offset 0x{effectiveOffset.toString(16)}
        </span>
        {entryIndex !== undefined && (
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
            #{entryIndex}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <StructDefinition struct={struct} hoveredField={hoveredField} />

        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900">
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Field
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Offset
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Size
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Raw
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Value
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody>
                {struct.fields.map((field) => (
                  <StructField
                    key={field.name}
                    field={field}
                    baseOffset={effectiveOffset}
                    buffer={raw}
                    isHovered={hoveredField === field.name}
                    onHover={onFieldHover}
                    onClick={onFieldClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
