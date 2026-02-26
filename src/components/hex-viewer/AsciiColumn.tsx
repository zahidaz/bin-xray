"use client";

import React, { useCallback } from "react";
import type { Region, RegionType } from "@/lib/elf/types";
import { getRegionColor } from "@/lib/colors";
import { useUiStore } from "@/lib/store/ui-store";

interface AsciiColumnProps {
  bytes: Uint8Array;
  startOffset: number;
  regionLookup: (offset: number) => Region | null;
}

function AsciiChar({
  byte,
  offset,
  region,
}: {
  byte: number;
  offset: number;
  region: Region | null;
}) {
  const selectedOffset = useUiStore((s) => s.selectedOffset);
  const highlightRange = useUiStore((s) => s.highlightRange);
  const setSelectedOffset = useUiStore((s) => s.setSelectedOffset);
  const setHighlightedRegion = useUiStore((s) => s.setHighlightedRegion);

  const isSelected = selectedOffset === offset;
  const isHighlighted =
    highlightRange !== null &&
    offset >= highlightRange.start &&
    offset < highlightRange.end;

  const regionType: RegionType = region?.type ?? "unknown";
  const color = getRegionColor(regionType);

  const char = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".";

  const handleClick = useCallback(() => {
    setSelectedOffset(offset);
  }, [offset, setSelectedOffset]);

  const handleMouseEnter = useCallback(() => {
    setHighlightedRegion(region);
  }, [region, setHighlightedRegion]);

  const handleMouseLeave = useCallback(() => {
    setHighlightedRegion(null);
  }, [setHighlightedRegion]);

  let className =
    "inline-block w-[8px] text-center font-mono text-xs leading-5 cursor-pointer";

  if (isSelected) {
    className += " bg-white/20 text-white font-bold";
  } else if (isHighlighted) {
    className += " bg-yellow-400/15 text-yellow-200";
  } else {
    className += ` ${color.text}`;
  }

  return (
    <span
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {char}
    </span>
  );
}

const MemoAsciiChar = React.memo(AsciiChar);

export const AsciiColumn = React.memo(function AsciiColumn({
  bytes,
  startOffset,
  regionLookup,
}: AsciiColumnProps) {
  return (
    <div className="flex select-none">
      {Array.from(bytes).map((byte, i) => (
        <MemoAsciiChar
          key={i}
          byte={byte}
          offset={startOffset + i}
          region={regionLookup(startOffset + i)}
        />
      ))}
    </div>
  );
});
