"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/lib/store/ui-store";
import { useBinaryStore } from "@/lib/store/binary-store";

export function HexTooltip() {
  const selectedOffset = useUiStore((s) => s.selectedOffset);
  const highlightedRegion = useUiStore((s) => s.highlightedRegion);
  const raw = useBinaryStore((s) => s.raw);

  const offset = selectedOffset;
  const hasData = offset !== null && raw !== null && offset < raw.byteLength;

  let byte = 0;
  if (hasData) {
    byte = new Uint8Array(raw)[offset];
  }

  return (
    <AnimatePresence>
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl"
        >
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
            <span className="text-zinc-500">Offset</span>
            <span className="text-zinc-200">
              0x{offset.toString(16).padStart(8, "0")}
            </span>

            <span className="text-zinc-500">Hex</span>
            <span className="text-zinc-200">
              0x{byte.toString(16).padStart(2, "0")}
            </span>

            <span className="text-zinc-500">Decimal</span>
            <span className="text-zinc-200">{byte}</span>

            <span className="text-zinc-500">Binary</span>
            <span className="text-zinc-200">
              {byte.toString(2).padStart(8, "0")}
            </span>

            {highlightedRegion && (
              <>
                <span className="text-zinc-500">Field</span>
                <span className="text-zinc-200">{highlightedRegion.name}</span>

                <span className="text-zinc-500">Region</span>
                <span className="text-zinc-200">
                  {highlightedRegion.description}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
