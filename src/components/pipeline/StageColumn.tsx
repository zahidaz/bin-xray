"use client";

import { motion } from "framer-motion";
import { StageFile } from "./StageFile";

interface StageColumnProps {
  index: number;
  name: string;
  description: string;
  tool: string;
  fileName: string;
  fileExtension: string;
  fileSize: string;
  previousSize?: string;
  isActive: boolean;
  isLast: boolean;
  additions?: string[];
  onStageClick: (index: number) => void;
  onFileClick: (index: number) => void;
}

export function StageColumn({
  index,
  name,
  description,
  tool,
  fileName,
  fileExtension,
  fileSize,
  previousSize,
  isActive,
  isLast,
  additions,
  onStageClick,
  onFileClick,
}: StageColumnProps) {
  return (
    <div className="flex items-start gap-0">
      <motion.div
        className="flex flex-col items-center w-full cursor-pointer"
        onClick={() => onStageClick(index)}
        whileHover={{ scale: 1.01 }}
      >
        <motion.div
          className="w-full rounded-lg border p-4 transition-colors"
          animate={{
            borderColor: isActive ? "#3b82f6" : "#27272a",
            backgroundColor: isActive ? "rgba(59, 130, 246, 0.05)" : "#09090b",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              animate={{
                backgroundColor: isActive ? "#3b82f6" : "#27272a",
                color: isActive ? "#ffffff" : "#71717a",
              }}
            >
              {index + 1}
            </motion.div>
            <h3 className="text-sm font-bold text-zinc-200">{name}</h3>
          </div>

          <p className="text-[11px] text-zinc-500 mb-1">{description}</p>
          <span className="text-[10px] font-mono text-zinc-600">{tool}</span>

          <div className="mt-3">
            <StageFile
              name={fileName}
              extension={fileExtension}
              size={fileSize}
              previousSize={previousSize}
              onClick={() => onFileClick(index)}
            />
          </div>

          {additions && additions.length > 0 && (
            <div className="mt-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                Linker adds
              </span>
              {additions.map((item) => (
                <div
                  key={item}
                  className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 rounded px-2 py-0.5"
                >
                  + {item}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {!isLast && (
        <div className="flex items-center self-center shrink-0 px-1">
          <motion.svg
            width="32"
            height="20"
            viewBox="0 0 32 20"
            className="shrink-0"
          >
            <motion.line
              x1="0"
              y1="10"
              x2="24"
              y2="10"
              stroke="#3f3f46"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            />
            <motion.polygon
              points="24,5 32,10 24,15"
              fill="#3f3f46"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.4 }}
            />
          </motion.svg>
        </div>
      )}
    </div>
  );
}
