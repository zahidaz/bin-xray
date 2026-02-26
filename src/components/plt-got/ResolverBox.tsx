"use client";

import { motion } from "framer-motion";

interface ResolverBoxProps {
  symbolName: string;
  libraryName: string;
  isActive: boolean;
  isPatching: boolean;
}

export function ResolverBox({
  symbolName,
  libraryName,
  isActive,
  isPatching,
}: ResolverBoxProps) {
  return (
    <motion.div
      className="rounded-lg border bg-zinc-950 overflow-hidden"
      animate={{
        borderColor: isActive ? "#8b5cf6" : "#27272a",
        boxShadow: isActive ? "0 0 20px rgba(139, 92, 246, 0.2)" : "none",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Dynamic Resolver (ld-linux.so)
        </span>
        {isActive && (
          <motion.span
            className="text-[10px] font-bold text-violet-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ACTIVE
          </motion.span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-semibold text-zinc-500">
            Looking up
          </span>
          <span className="font-mono text-sm text-violet-300">{symbolName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-semibold text-zinc-500">
            In library
          </span>
          <span className="font-mono text-sm text-zinc-300">{libraryName}</span>
        </div>
        {isActive && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-violet-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="text-xs text-violet-400">
              {isPatching ? "Patching GOT entry..." : "Searching symbol table..."}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
