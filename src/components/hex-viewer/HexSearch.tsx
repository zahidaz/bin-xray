"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useUiStore } from "@/lib/store/ui-store";

interface HexSearchProps {
  buffer: Uint8Array;
  onNavigate: (offset: number) => void;
}

function parseHexPattern(input: string): number[] | null {
  const cleaned = input.replace(/\s+/g, "");
  if (cleaned.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cleaned)) {
    return null;
  }
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return bytes;
}

function parseStringPattern(input: string): number[] {
  return Array.from(input).map((c) => c.charCodeAt(0));
}

function findAllMatches(buffer: Uint8Array, pattern: number[]): number[] {
  const matches: number[] = [];
  if (pattern.length === 0) return matches;

  for (let i = 0; i <= buffer.length - pattern.length; i++) {
    let found = true;
    for (let j = 0; j < pattern.length; j++) {
      if (buffer[i + j] !== pattern[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      matches.push(i);
    }
  }
  return matches;
}

export function HexSearch({ buffer, onNavigate }: HexSearchProps) {
  const setHighlightRange = useUiStore((s) => s.setHighlightRange);
  const setSelectedOffset = useUiStore((s) => s.setSelectedOffset);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"hex" | "string">("hex");
  const [currentMatch, setCurrentMatch] = useState(0);

  const matches = useMemo(() => {
    if (!query.trim()) return [];

    let pattern: number[] | null = null;
    if (mode === "hex") {
      pattern = parseHexPattern(query);
    } else {
      pattern = parseStringPattern(query);
    }

    if (!pattern || pattern.length === 0) return [];
    return findAllMatches(buffer, pattern);
  }, [query, mode, buffer]);

  const patternLength = useMemo(() => {
    if (!query.trim()) return 0;
    if (mode === "hex") {
      const p = parseHexPattern(query);
      return p?.length ?? 0;
    }
    return query.length;
  }, [query, mode]);

  useEffect(() => {
    if (matches.length > 0) {
      setCurrentMatch(0);
      const offset = matches[0];
      setSelectedOffset(offset);
      setHighlightRange({
        start: offset,
        end: offset + patternLength,
        source: "search",
      });
      onNavigate(offset);
    } else {
      setHighlightRange(null);
    }
  }, [matches, patternLength, setSelectedOffset, setHighlightRange, onNavigate]);

  const navigateToMatch = useCallback(
    (index: number) => {
      if (matches.length === 0) return;
      const safeIndex = ((index % matches.length) + matches.length) % matches.length;
      setCurrentMatch(safeIndex);
      const offset = matches[safeIndex];
      setSelectedOffset(offset);
      setHighlightRange({
        start: offset,
        end: offset + patternLength,
        source: "search",
      });
      onNavigate(offset);
    },
    [matches, patternLength, setSelectedOffset, setHighlightRange, onNavigate]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && matches.length > 0) {
        if (e.shiftKey) {
          navigateToMatch(currentMatch - 1);
        } else {
          navigateToMatch(currentMatch + 1);
        }
      }
      if (e.key === "Escape") {
        setQuery("");
        setHighlightRange(null);
      }
    },
    [currentMatch, matches.length, navigateToMatch, setHighlightRange]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setCurrentMatch(0);
    setHighlightRange(null);
  }, [setHighlightRange]);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900/80">
      <div className="flex rounded-md border border-zinc-700 overflow-hidden">
        <button
          onClick={() => setMode("hex")}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition-colors ${
            mode === "hex"
              ? "bg-zinc-700 text-zinc-200"
              : "bg-zinc-800 text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Hex
        </button>
        <button
          onClick={() => setMode("string")}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition-colors ${
            mode === "string"
              ? "bg-zinc-700 text-zinc-200"
              : "bg-zinc-800 text-zinc-500 hover:text-zinc-400"
          }`}
        >
          Str
        </button>
      </div>

      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={mode === "hex" ? "7f 45 4c 46" : "Search string..."}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {matches.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-mono text-zinc-400">
            {currentMatch + 1}/{matches.length}
          </span>
          <button
            onClick={() => navigateToMatch(currentMatch - 1)}
            className="px-1 py-0.5 text-xs text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-700"
          >
            ▲
          </button>
          <button
            onClick={() => navigateToMatch(currentMatch + 1)}
            className="px-1 py-0.5 text-xs text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-700"
          >
            ▼
          </button>
        </div>
      )}

      {query && matches.length === 0 && (
        <span className="text-xs font-mono text-red-400 shrink-0">
          No matches
        </span>
      )}
    </div>
  );
}
