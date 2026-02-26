"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  options: [string, string];
  value: string;
  onChange: (value: string) => void;
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  const activeIndex = value === options[1] ? 1 : 0;

  return (
    <div className="relative flex bg-zinc-800 rounded-lg p-1 border border-zinc-700">
      <motion.div
        className="absolute top-1 bottom-1 rounded-md bg-blue-600"
        initial={false}
        animate={{
          left: activeIndex === 0 ? 4 : "50%",
          width: "calc(50% - 4px)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === option ? "text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
