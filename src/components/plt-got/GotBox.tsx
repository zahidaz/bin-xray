"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GotBoxProps {
  functionName: string;
  currentValue: string;
  resolvedValue: string;
  isResolved: boolean;
  isActive: boolean;
}

export function GotBox({
  functionName,
  currentValue,
  resolvedValue,
  isResolved,
  isActive,
}: GotBoxProps) {
  return (
    <motion.div
      className="rounded-lg border bg-zinc-950 overflow-hidden"
      animate={{
        borderColor: isActive ? "#f43f5e" : "#27272a",
        boxShadow: isActive ? "0 0 20px rgba(244, 63, 94, 0.2)" : "none",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          GOT Entry
        </span>
        <span className="text-[10px] font-mono text-rose-400">
          {functionName}@got
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-semibold uppercase text-zinc-500">
            Value
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={isResolved ? "resolved" : "unresolved"}
              className={`font-mono text-sm font-bold ${
                isResolved ? "text-green-400" : "text-rose-400"
              }`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              {isResolved ? resolvedValue : currentValue}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="h-1.5 rounded-full"
            animate={{
              width: isResolved ? "100%" : "30%",
              backgroundColor: isResolved ? "#22c55e" : "#f43f5e",
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-2 text-[10px] text-zinc-500 font-mono">
          {isResolved ? "Resolved - direct jump" : "Unresolved - points to PLT stub"}
        </div>
      </div>
    </motion.div>
  );
}
