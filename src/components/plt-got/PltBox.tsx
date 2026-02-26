"use client";

import { motion } from "framer-motion";

interface PltBoxProps {
  functionName: string;
  stubLines: { instruction: string; operands: string }[];
  activeLine: number;
  isActive: boolean;
}

export function PltBox({ functionName, stubLines, activeLine, isActive }: PltBoxProps) {
  return (
    <motion.div
      className="rounded-lg border bg-zinc-950 overflow-hidden"
      animate={{
        borderColor: isActive ? "#ec4899" : "#27272a",
        boxShadow: isActive ? "0 0 20px rgba(236, 72, 153, 0.2)" : "none",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          PLT Stub
        </span>
        <span className="text-[10px] font-mono text-pink-400">
          {functionName}@plt
        </span>
      </div>
      <div className="p-3 font-mono text-xs">
        {stubLines.map((line, i) => (
          <motion.div
            key={i}
            className="flex gap-3 px-2 py-0.5 rounded"
            animate={{
              backgroundColor:
                activeLine === i && isActive
                  ? "rgba(236, 72, 153, 0.15)"
                  : "transparent",
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-pink-400 w-16 shrink-0">{line.instruction}</span>
            <span className="text-zinc-300">{line.operands}</span>
            {activeLine === i && isActive && (
              <motion.span
                className="text-pink-400 ml-auto"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
              >
                &#x25C0;
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
