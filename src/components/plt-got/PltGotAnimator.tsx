"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/lib/store/ui-store";
import { CodeBox } from "./CodeBox";
import { PltBox } from "./PltBox";
import { GotBox } from "./GotBox";
import { ResolverBox } from "./ResolverBox";
import { AnimationControls } from "./AnimationControls";

const STEP_DESCRIPTIONS = [
  "Program calls printf@plt from application code",
  "PLT stub reads GOT entry - initially points back to PLT+6",
  "Push relocation index onto stack, jump to PLT[0] (resolver trampoline)",
  "Dynamic linker resolves printf in libc, patches GOT with real address",
  "Second call to printf@plt - GOT now has real address, jumps directly to libc",
];

const CODE_LINES = [
  { addr: "0x401030", instruction: "mov", operands: "$0x1, %edi" },
  { addr: "0x401035", instruction: "lea", operands: '0x2fcc(%rip), %rsi  # "Hello"' },
  { addr: "0x40103c", instruction: "call", operands: "printf@plt" },
  { addr: "0x401041", instruction: "xor", operands: "%eax, %eax" },
  { addr: "0x401043", instruction: "call", operands: "printf@plt" },
];

const PLT_LINES = [
  { instruction: "jmp", operands: "*printf@GOT(%rip)" },
  { instruction: "push", operands: "$0x0  # reloc index" },
  { instruction: "jmp", operands: "PLT[0]  # resolver" },
];

interface FlowArrowProps {
  from: string;
  to: string;
  color: string;
  label?: string;
}

function FlowArrow({ from, to, color, label }: FlowArrowProps) {
  return (
    <motion.div
      className="flex items-center gap-1 justify-center py-1"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-[10px] font-mono" style={{ color }}>
        {from}
      </span>
      <motion.svg
        width="40"
        height="12"
        viewBox="0 0 40 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
      >
        <motion.line
          x1="0"
          y1="6"
          x2="32"
          y2="6"
          stroke={color}
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.polygon
          points="32,2 40,6 32,10"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      </motion.svg>
      <span className="text-[10px] font-mono" style={{ color }}>
        {to}
      </span>
      {label && (
        <span className="text-[9px] text-zinc-500 ml-1">({label})</span>
      )}
    </motion.div>
  );
}

export function PltGotAnimator() {
  const step = useUiStore((s) => s.pltGotStep);
  const setStep = useUiStore((s) => s.setPltGotStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
  }, [isPlaying, stopPlayback]);

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setStep(
        useUiStore.getState().pltGotStep >= 4
          ? 0
          : useUiStore.getState().pltGotStep + 1
      );
    }, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, setStep]);

  const handleReset = useCallback(() => {
    stopPlayback();
    setStep(0);
  }, [stopPlayback, setStep]);

  const codeActive = step === 0 || step === 4;
  const codeLine = step === 0 ? 2 : step === 4 ? 4 : -1;
  const pltActive = step === 1 || step === 2;
  const pltLine = step === 1 ? 0 : step === 2 ? 1 : -1;
  const gotActive = step === 1 || step === 3 || step === 4;
  const gotResolved = step >= 3;
  const resolverActive = step === 2 || step === 3;
  const resolverPatching = step === 3;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-100">
          PLT/GOT Lazy Binding
        </h2>
      </div>

      <AnimationControls
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onReset={handleReset}
      />

      <motion.div
        className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
        key={step}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-sm text-zinc-300">
          {STEP_DESCRIPTIONS[step]}
        </span>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <CodeBox
          lines={CODE_LINES}
          activeLine={codeLine}
          isActive={codeActive}
        />
        <PltBox
          functionName="printf"
          stubLines={PLT_LINES}
          activeLine={pltLine}
          isActive={pltActive}
        />
      </div>

      <AnimatePresence mode="wait">
        <div className="flex flex-col items-center gap-1">
          {step === 0 && (
            <FlowArrow from="code" to="PLT" color="#3b82f6" label="call" />
          )}
          {step === 1 && (
            <FlowArrow from="PLT" to="GOT" color="#ec4899" label="jmp *GOT" />
          )}
          {step === 2 && (
            <FlowArrow from="PLT" to="resolver" color="#8b5cf6" label="push + jmp" />
          )}
          {step === 3 && (
            <FlowArrow from="resolver" to="GOT" color="#22c55e" label="patch" />
          )}
          {step === 4 && (
            <FlowArrow from="GOT" to="libc" color="#22c55e" label="direct jump" />
          )}
        </div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <GotBox
          functionName="printf"
          currentValue="0x401036 (PLT+6)"
          resolvedValue="0x7f...a4f0 (libc printf)"
          isResolved={gotResolved}
          isActive={gotActive}
        />
        <ResolverBox
          symbolName="printf"
          libraryName="libc.so.6"
          isActive={resolverActive}
          isPatching={resolverPatching}
        />
      </div>
    </div>
  );
}
