"use client";

import { motion } from "framer-motion";

interface CodeBoxProps {
  lines: { addr: string; instruction: string; operands: string }[];
  activeLine: number;
  isActive: boolean;
}

export function CodeBox({ lines, activeLine, isActive }: CodeBoxProps) {
  return (
    <motion.div
      className="rounded-lg border bg-zinc-950 overflow-hidden"
      animate={{
        borderColor: isActive ? "#3b82f6" : "#27272a",
        boxShadow: isActive ? "0 0 20px rgba(59, 130, 246, 0.15)" : "none",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Application Code
        </span>
      </div>
      <div className="p-3 font-mono text-xs">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            className="flex gap-3 px-2 py-0.5 rounded"
            animate={{
              backgroundColor:
                activeLine === i && isActive
                  ? "rgba(59, 130, 246, 0.15)"
                  : "transparent",
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-zinc-600 w-24 shrink-0">{line.addr}</span>
            <span className="text-sky-400 w-12 shrink-0">{line.instruction}</span>
            <span className="text-amber-300">{line.operands}</span>
            {activeLine === i && isActive && (
              <motion.span
                className="text-blue-400 ml-auto"
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
