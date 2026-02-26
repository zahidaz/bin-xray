import { useMemo } from "react";
import { useBinaryStore } from "../store/binary-store";
import type { Region } from "../elf/types";

export function useRegionAtOffset(offset: number | null): Region | null {
  const parsed = useBinaryStore((s) => s.parsed);

  return useMemo(() => {
    if (offset === null || !parsed) return null;
    return parsed.regions.lookup(offset);
  }, [offset, parsed]);
}

export function useAllRegionsAtOffset(offset: number | null): Region[] {
  const parsed = useBinaryStore((s) => s.parsed);

  return useMemo(() => {
    if (offset === null || !parsed) return [];
    return parsed.regions.lookupAll(offset);
  }, [offset, parsed]);
}
