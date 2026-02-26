"use client";

import { motion } from "framer-motion";
import { useUiStore } from "@/lib/store/ui-store";

const TOTAL_STEPS = 5;

interface AnimationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export function AnimationControls({
  isPlaying,
  onTogglePlay,
  onReset,
}: AnimationControlsProps) {
  const step = useUiStore((s) => s.pltGotStep);
  const setStep = useUiStore((s) => s.setPltGotStep);

  const canGoBack = step > 0;
  const canGoForward = step < TOTAL_STEPS - 1;

  return (
    <div className="flex items-center gap-3 bg-zinc-900 rounded-lg border border-zinc-800 px-4 py-2">
      <button
        onClick={onReset}
        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7a5 5 0 1 1 1.46 3.54"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M2 3v4h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={() => canGoBack && setStep(step - 1)}
        disabled={!canGoBack}
        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 3L5 7l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={onTogglePlay}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="3" y="2" width="3" height="10" rx="0.5" />
            <rect x="8" y="2" width="3" height="10" rx="0.5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M4 2.5l8 4.5-8 4.5V2.5z" />
          </svg>
        )}
      </button>

      <button
        onClick={() => canGoForward && setStep(step + 1)}
        disabled={!canGoForward}
        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex items-center gap-1.5 ml-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setStep(i)}
            className="relative w-6 h-6 rounded-full text-[10px] font-bold transition-colors"
            animate={{
              backgroundColor: i === step ? "#3b82f6" : i < step ? "#1e3a5f" : "#27272a",
              color: i <= step ? "#ffffff" : "#71717a",
            }}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>

      <span className="text-xs text-zinc-500 ml-2">
        Step {step + 1} / {TOTAL_STEPS}
      </span>
    </div>
  );
}
