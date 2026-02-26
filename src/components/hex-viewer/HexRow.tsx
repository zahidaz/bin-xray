"use client";

import React from "react";
import type { Region } from "@/lib/elf/types";
import { HexByte } from "./HexByte";
import { AsciiColumn } from "./AsciiColumn";

interface HexRowProps {
  rowOffset: number;
  bytes: Uint8Array;
  regionLookup: (offset: number) => Region | null;
}

export const HexRow = React.memo(function HexRow({
  rowOffset,
  bytes,
  regionLookup,
}: HexRowProps) {
  const offsetStr = rowOffset.toString(16).padStart(8, "0");

  return (
    <div className="flex items-center gap-3 px-3 h-[26px] hover:bg-zinc-800/40">
      <span className="font-mono text-xs text-zinc-500 w-[68px] shrink-0 select-none">
        {offsetStr}
      </span>

      <div className="flex gap-[2px] shrink-0">
        {Array.from(bytes.slice(0, 8)).map((byte, i) => (
          <HexByte
            key={i}
            byte={byte}
            offset={rowOffset + i}
            region={regionLookup(rowOffset + i)}
          />
        ))}
      </div>

      <div className="w-[6px] shrink-0" />

      <div className="flex gap-[2px] shrink-0">
        {Array.from(bytes.slice(8, 16)).map((byte, i) => (
          <HexByte
            key={i + 8}
            byte={byte}
            offset={rowOffset + 8 + i}
            region={regionLookup(rowOffset + 8 + i)}
          />
        ))}
      </div>

      <div className="border-l border-zinc-700 h-4 shrink-0" />

      <AsciiColumn
        bytes={bytes}
        startOffset={rowOffset}
        regionLookup={regionLookup}
      />
    </div>
  );
});
