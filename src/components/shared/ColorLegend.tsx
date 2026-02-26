"use client";

import { REGION_COLORS } from "@/lib/colors";
import type { RegionType } from "@/lib/elf/types";

interface ColorLegendProps {
  regions: { type: RegionType; name: string }[];
  onHover?: (type: RegionType | null) => void;
  onClick?: (type: RegionType) => void;
}

export function ColorLegend({ regions, onHover, onClick }: ColorLegendProps) {
  const unique = Array.from(
    new Map(regions.map((r) => [r.type, r])).values()
  );

  return (
    <div className="flex flex-wrap gap-2">
      {unique.map((region) => {
        const color = REGION_COLORS[region.type] ?? REGION_COLORS.unknown;
        return (
          <button
            key={region.type}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${color.bg} ${color.text} hover:opacity-80 transition-opacity`}
            onMouseEnter={() => onHover?.(region.type)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onClick?.(region.type)}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: color.hex }}
            />
            {region.name}
          </button>
        );
      })}
    </div>
  );
}
