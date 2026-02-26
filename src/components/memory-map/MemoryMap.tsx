"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";
import { DiskLayout } from "./DiskLayout";
import { MemoryLayout } from "./MemoryLayout";
import { MappingArrow } from "./MappingArrow";

export function MemoryMap() {
  const parsed = useBinaryStore((s) => s.parsed);
  const [compressed, setCompressed] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const diskRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const memRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<
    { index: number; fromY: number; toY: number; fromH: number; toH: number }[]
  >([]);
  const [containerTop, setContainerTop] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);

  const computeArrows = useCallback(() => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    setContainerTop(cRect.top);
    const result: typeof arrows = [];
    let maxBottom = 0;

    diskRefs.current.forEach((diskEl, index) => {
      const memEl = memRefs.current.get(index);
      if (!diskEl || !memEl) return;

      const dRect = diskEl.getBoundingClientRect();
      const mRect = memEl.getBoundingClientRect();
      result.push({
        index,
        fromY: dRect.top,
        toY: mRect.top,
        fromH: dRect.height,
        toH: mRect.height,
      });
      maxBottom = Math.max(maxBottom, dRect.bottom, mRect.bottom);
    });

    setArrows(result);
    setSvgHeight(maxBottom - cRect.top + 20);
  }, []);

  useEffect(() => {
    computeArrows();
    window.addEventListener("resize", computeArrows);
    return () => window.removeEventListener("resize", computeArrows);
  }, [computeArrows, parsed, compressed]);

  useEffect(() => {
    const timer = setTimeout(computeArrows, 100);
    return () => clearTimeout(timer);
  }, [compressed, computeArrows]);

  if (!parsed) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Load a binary to view its memory map
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-zinc-100">
          Memory Map
        </h2>
        <button
          onClick={() => setCompressed((v) => !v)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            compressed
              ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {compressed ? "Compressed" : "Proportional"}
        </button>
      </div>

      <div ref={containerRef} className="relative grid grid-cols-[1fr_120px_1fr] gap-0">
        <DiskLayout
          programs={parsed.programs}
          compressed={compressed}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
          blockRefs={diskRefs}
        />

        <div className="relative">
          <svg
            width="120"
            height={svgHeight || 400}
            className="absolute top-0 left-0"
          >
            {arrows.map((a) => (
              <MappingArrow
                key={a.index}
                fromY={a.fromY}
                toY={a.toY}
                fromHeight={a.fromH}
                toHeight={a.toH}
                segmentIndex={a.index}
                isHovered={hoveredIndex === a.index}
                width={120}
                containerTop={containerTop}
              />
            ))}
          </svg>
        </div>

        <MemoryLayout
          programs={parsed.programs}
          compressed={compressed}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
          blockRefs={memRefs}
        />
      </div>
    </div>
  );
}
