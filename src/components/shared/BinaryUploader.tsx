"use client";

import { useCallback } from "react";
import { useBinaryStore } from "@/lib/store/binary-store";

export function BinaryUploader() {
  const loadFile = useBinaryStore((s) => s.loadFile);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
    >
      <label className="cursor-pointer">
        <input
          type="file"
          onChange={handleChange}
          className="hidden"
          accept=".bin,.o,.so,.elf,*"
        />
        <div className="text-zinc-400">
          <svg
            className="mx-auto h-12 w-12 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-300">
            Drop an ELF binary here
          </p>
          <p className="text-xs mt-1 text-zinc-500">or click to browse</p>
        </div>
      </label>
    </div>
  );
}
