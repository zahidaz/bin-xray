"use client";

import { useState } from "react";

interface EnumValueProps {
  rawValue: string;
  decodedValue: string;
  allValues?: Record<string, string>;
}

export function EnumValue({ rawValue, decodedValue, allValues }: EnumValueProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (allValues) setExpanded(!expanded);
        }}
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
          allValues
            ? "cursor-pointer bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
            : "cursor-default bg-zinc-700/50 text-zinc-300"
        }`}
      >
        <span className="font-mono text-zinc-500">{rawValue}</span>
        <span className="text-[10px] text-zinc-600">{"="}</span>
        <span>{decodedValue}</span>
        {allValues && (
          <svg
            className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {expanded && allValues && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-max min-w-[200px] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
          {Object.entries(allValues).map(([key, label]) => (
            <div
              key={key}
              className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                key === rawValue
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-zinc-400"
              }`}
            >
              <span className="font-mono text-zinc-500">{key}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
