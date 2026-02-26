import { create } from "zustand";
import type { ElfFile } from "../elf/types";
import { parseElf } from "../elf/parser";

interface BinaryState {
  raw: ArrayBuffer | null;
  parsed: ElfFile | null;
  fileName: string;
  error: string | null;
  loading: boolean;
  loadSample: (name: string) => Promise<void>;
  loadFile: (file: File) => Promise<void>;
  loadBuffer: (buffer: ArrayBuffer, name: string) => void;
  clear: () => void;
}

export const useBinaryStore = create<BinaryState>((set) => ({
  raw: null,
  parsed: null,
  fileName: "",
  error: null,
  loading: false,

  loadSample: async (name: string) => {
    set({ loading: true, error: null });
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/samples/${name}`);
      if (!response.ok) throw new Error(`Failed to load ${name}`);
      const buffer = await response.arrayBuffer();
      const parsed = parseElf(buffer);
      set({ raw: buffer, parsed, fileName: name, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to load binary",
        loading: false,
      });
    }
  },

  loadFile: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseElf(buffer);
      set({ raw: buffer, parsed, fileName: file.name, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to parse binary",
        loading: false,
      });
    }
  },

  loadBuffer: (buffer: ArrayBuffer, name: string) => {
    try {
      const parsed = parseElf(buffer);
      set({ raw: buffer, parsed, fileName: name, error: null });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to parse binary",
      });
    }
  },

  clear: () => {
    set({ raw: null, parsed: null, fileName: "", error: null });
  },
}));
