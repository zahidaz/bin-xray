"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useBinaryStore } from "@/lib/store/binary-store";
import { useUiStore } from "@/lib/store/ui-store";
import { REGION_COLORS } from "@/lib/colors";
import type { Region, RegionType } from "@/lib/elf/types";
import { HexRow } from "./HexRow";
import { HexSearch } from "./HexSearch";
import { HexTooltip } from "./HexTooltip";

const BYTES_PER_ROW = 16;
const ROW_HEIGHT = 26;

export function HexViewer() {
  const raw = useBinaryStore((s) => s.raw);
  const parsed = useBinaryStore((s) => s.parsed);
  const selectedOffset = useUiStore((s) => s.selectedOffset);

  const parentRef = useRef<HTMLDivElement>(null);
  const prevSelectedOffset = useRef<number | null>(null);

  const bytes = useMemo(() => {
    if (!raw) return new Uint8Array(0);
    return new Uint8Array(raw);
  }, [raw]);

  const totalRows = Math.ceil(bytes.length / BYTES_PER_ROW);

  const regionLookup = useCallback(
    (offset: number): Region | null => {
      if (!parsed) return null;
      return parsed.regions.lookup(offset);
    },
    [parsed]
  );

  const activeRegions = useMemo((): Region[] => {
    if (!parsed) return [];
    return parsed.regions.regions;
  }, [parsed]);

  const uniqueRegionTypes = useMemo(() => {
    const seen = new Map<RegionType, Region>();
    for (const region of activeRegions) {
      if (!seen.has(region.type)) {
        seen.set(region.type, region);
      }
    }
    return Array.from(seen.entries());
  }, [activeRegions]);

  const virtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  useEffect(() => {
    if (
      selectedOffset !== null &&
      selectedOffset !== prevSelectedOffset.current
    ) {
      const row = Math.floor(selectedOffset / BYTES_PER_ROW);
      virtualizer.scrollToIndex(row, { align: "center" });
    }
    prevSelectedOffset.current = selectedOffset;
  }, [selectedOffset, virtualizer]);

  const handleSearchNavigate = useCallback(
    (offset: number) => {
      const row = Math.floor(offset / BYTES_PER_ROW);
      virtualizer.scrollToIndex(row, { align: "center" });
    },
    [virtualizer]
  );

  if (!raw) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">
        Load a binary to view hex data
      </div>
    );
  }

  return (
    <div className="flex h-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        <HexSearch buffer={bytes} onNavigate={handleSearchNavigate} />

        <div className="flex items-center gap-4 px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/50">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Offset
          </span>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider flex-1">
            Hex
          </span>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider w-[128px]">
            ASCII
          </span>
        </div>

        <div className="relative">
          <HexTooltip />
          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: "calc(100vh - 200px)" }}
          >
            <div
              className="relative w-full"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const rowOffset = virtualRow.index * BYTES_PER_ROW;
                const end = Math.min(rowOffset + BYTES_PER_ROW, bytes.length);
                const rowBytes = bytes.slice(rowOffset, end);

                return (
                  <div
                    key={virtualRow.index}
                    className="absolute left-0 w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <HexRow
                      rowOffset={rowOffset}
                      bytes={rowBytes}
                      regionLookup={regionLookup}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-48 border-l border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-zinc-800">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Regions
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          {uniqueRegionTypes.map(([type, region]) => {
            const color = REGION_COLORS[type] ?? REGION_COLORS.unknown;
            return (
              <button
                key={type}
                onClick={() => {
                  useUiStore.getState().setSelectedOffset(region.start);
                  useUiStore.getState().setHighlightRange({
                    start: region.start,
                    end: region.end,
                    source: "legend",
                  });
                }}
                className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-zinc-800/60 transition-colors group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-mono text-[10px] text-zinc-400 group-hover:text-zinc-200 truncate text-left">
                  {region.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2 border-t border-zinc-800">
          <div className="font-mono text-[10px] text-zinc-600">
            {bytes.length.toLocaleString()} bytes
          </div>
          <div className="font-mono text-[10px] text-zinc-600">
            {totalRows.toLocaleString()} rows
          </div>
        </div>
      </div>
    </div>
  );
}
