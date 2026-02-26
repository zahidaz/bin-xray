"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizOption {
  text: string;
  correct: boolean;
  explanation: string;
}

interface QuizProps {
  question: string;
  options: QuizOption[];
}

export function Quiz({ question, options }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
  };

  const reset = () => {
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 my-8">
      <div className="text-sm font-medium text-blue-400 mb-2">
        Challenge
      </div>
      <p className="text-zinc-200 font-medium mb-4">{question}</p>

      <div className="space-y-2">
        {options.map((option, i) => {
          let borderColor = "border-zinc-700 hover:border-zinc-600";
          if (revealed && i === selected) {
            borderColor = option.correct
              ? "border-green-500 bg-green-500/10"
              : "border-red-500 bg-red-500/10";
          } else if (revealed && option.correct) {
            borderColor = "border-green-500/50";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 rounded-lg border ${borderColor} text-sm text-zinc-300 transition-all disabled:cursor-default`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-4 p-4 rounded-lg text-sm ${
                options[selected].correct
                  ? "bg-green-500/10 text-green-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              <p className="font-medium mb-1">
                {options[selected].correct ? "Correct!" : "Not quite."}
              </p>
              <p className="text-zinc-400">
                {options[selected].explanation}
              </p>
            </div>
            <button
              onClick={reset}
              className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
