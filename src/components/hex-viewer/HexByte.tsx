"use client";

import React, { useCallback } from "react";
import type { Region, RegionType } from "@/lib/elf/types";
import { getRegionColor } from "@/lib/colors";
import { useUiStore } from "@/lib/store/ui-store";

interface HexByteProps {
  byte: number;
  offset: number;
  region: Region | null;
}

export const HexByte = React.memo(function HexByte({
  byte,
  offset,
  region,
}: HexByteProps) {
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

  const handleClick = useCallback(() => {
    setSelectedOffset(offset);
  }, [offset, setSelectedOffset]);

  const handleMouseEnter = useCallback(() => {
    setHighlightedRegion(region);
  }, [region, setHighlightedRegion]);

  const handleMouseLeave = useCallback(() => {
    setHighlightedRegion(null);
  }, [setHighlightedRegion]);

  const hex = byte.toString(16).padStart(2, "0");

  let className =
    "inline-block w-6 text-center font-mono text-xs leading-5 cursor-pointer rounded-sm transition-colors duration-75";

  if (isSelected) {
    className += " ring-2 ring-white/80 bg-white/20 text-white font-bold";
  } else if (isHighlighted) {
    className += " ring-1 ring-yellow-400/60 bg-yellow-400/15 text-yellow-200";
  } else {
    className += ` ${color.bg} ${color.text} hover:brightness-150`;
  }

  return (
    <span
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-offset={offset}
    >
      {hex}
    </span>
  );
});
