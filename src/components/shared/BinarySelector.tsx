"use client";

import { useBinaryStore } from "@/lib/store/binary-store";
import { SAMPLE_BINARIES } from "@/lib/samples";

export function BinarySelector() {
  const { loadSample, fileName, loading } = useBinaryStore();

  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLE_BINARIES.map((sample) => (
        <button
          key={sample.file}
          onClick={() => loadSample(sample.file)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            fileName === sample.file
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
          } disabled:opacity-50`}
          title={sample.description}
        >
          {sample.name}
        </button>
      ))}
    </div>
  );
}
