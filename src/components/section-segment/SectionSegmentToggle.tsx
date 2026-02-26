"use client";

import { useState, useCallback } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";
import { useUiStore, type ViewMode } from "@/lib/store/ui-store";
import { Toggle } from "@/components/shared/Toggle";
import { ByteMap } from "./ByteMap";
import { RegionLabel } from "./RegionLabel";
import { getRegionColor, getSegmentColor } from "@/lib/colors";
import { P_TYPE } from "@/lib/elf/constants";
import { sectionNameToRegionType } from "@/lib/elf/regions";

export function SectionSegmentToggle() {
  const parsed = useBinaryStore((s) => s.parsed);
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const setSelectedOffset = useUiStore((s) => s.setSelectedOffset);
  const setHighlightRange = useUiStore((s) => s.setHighlightRange);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleOffsetClick = useCallback(
    (offset: number) => {
      setSelectedOffset(offset);
    },
    [setSelectedOffset]
  );

  const handleRegionHover = useCallback(
    (info: { name: string; offset: number; size: number } | null) => {
      if (info) {
        setHoveredRegion(info.name);
        setHighlightRange({
          start: info.offset,
          end: info.offset + info.size,
          source: "bytemap",
        });
      } else {
        setHoveredRegion(null);
        setHighlightRange(null);
      }
    },
    [setHighlightRange]
  );

  if (!parsed) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Load a binary to view sections and segments
      </div>
    );
  }

  const sections = parsed.sections.filter((s) => s.sh_size > 0n);
  const programs = parsed.programs.filter((p) => p.p_filesz > 0n);

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-zinc-100">
          Sections & Segments
        </h2>
        <Toggle
          options={["Sections", "Segments"]}
          value={viewMode === "sections" ? "Sections" : "Segments"}
          onChange={(v) => setViewMode(v === "Sections" ? "sections" : "segments")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            {viewMode === "sections" ? "Section" : "Segment"} File Layout
          </h3>
          <ByteMap
            sections={parsed.sections}
            programs={parsed.programs}
            fileSize={parsed.raw.byteLength}
            viewMode={viewMode}
            onOffsetClick={handleOffsetClick}
            onRegionHover={handleRegionHover}
          />
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Sections ({sections.length})
              </h3>
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[500px]">
                {sections.map((section) => {
                  const regionType = sectionNameToRegionType(section.resolvedName);
                  const color = getRegionColor(regionType).hex;
                  return (
                    <RegionLabel
                      key={section.index}
                      name={section.resolvedName || `[${section.index}]`}
                      size={Number(section.sh_size)}
                      color={color}
                      isHovered={hoveredRegion === section.resolvedName}
                      onMouseEnter={() =>
                        handleRegionHover({
                          name: section.resolvedName,
                          offset: Number(section.sh_offset),
                          size: Number(section.sh_size),
                        })
                      }
                      onMouseLeave={() => handleRegionHover(null)}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Segments ({programs.length})
              </h3>
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[500px]">
                {programs.map((phdr) => {
                  const color = getSegmentColor(phdr.index);
                  const typeName = P_TYPE[phdr.p_type] ?? `segment[${phdr.index}]`;
                  return (
                    <RegionLabel
                      key={phdr.index}
                      name={typeName}
                      size={Number(phdr.p_filesz)}
                      color={color}
                      isHovered={hoveredRegion === typeName}
                      onMouseEnter={() =>
                        handleRegionHover({
                          name: typeName,
                          offset: Number(phdr.p_offset),
                          size: Number(phdr.p_filesz),
                        })
                      }
                      onMouseLeave={() => handleRegionHover(null)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              How they relate
            </h4>
            <div className="space-y-2">
              {programs.map((phdr) => {
                if (phdr.p_filesz <= 0n) return null;
                const segStart = Number(phdr.p_offset);
                const segEnd = segStart + Number(phdr.p_filesz);
                const contained = sections.filter((s) => {
                  const secStart = Number(s.sh_offset);
                  const secEnd = secStart + Number(s.sh_size);
                  return secStart >= segStart && secEnd <= segEnd;
                });
                if (contained.length === 0) return null;
                const segColor = getSegmentColor(phdr.index);
                const typeName = P_TYPE[phdr.p_type] ?? `segment[${phdr.index}]`;

                return (
                  <div key={phdr.index} className="flex items-start gap-2">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0 mt-1"
                      style={{ backgroundColor: segColor }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-medium text-zinc-300">
                        {typeName}
                      </span>
                      <span className="text-zinc-600 mx-1.5 text-xs">contains</span>
                      <span className="text-xs text-zinc-400">
                        {contained.map((s) => s.resolvedName || `[${s.index}]`).join(", ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
