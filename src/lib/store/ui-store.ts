import { create } from "zustand";
import type { Region } from "../elf/types";

export type ViewMode = "sections" | "segments";

export interface HighlightRange {
  start: number;
  end: number;
  source: string;
}

interface UiState {
  selectedOffset: number | null;
  highlightedRegion: Region | null;
  highlightRange: HighlightRange | null;
  hoveredField: string | null;
  viewMode: ViewMode;
  pltGotStep: number;
  activeModule: string | null;
  sidebarOpen: boolean;

  setSelectedOffset: (offset: number | null) => void;
  setHighlightedRegion: (region: Region | null) => void;
  setHighlightRange: (range: HighlightRange | null) => void;
  setHoveredField: (field: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setPltGotStep: (step: number) => void;
  setActiveModule: (module: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedOffset: null,
  highlightedRegion: null,
  highlightRange: null,
  hoveredField: null,
  viewMode: "sections",
  pltGotStep: 0,
  activeModule: null,
  sidebarOpen: false,

  setSelectedOffset: (offset) => set({ selectedOffset: offset }),
  setHighlightedRegion: (region) => set({ highlightedRegion: region }),
  setHighlightRange: (range) => set({ highlightRange: range }),
  setHoveredField: (field) => set({ hoveredField: field }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPltGotStep: (step) => set({ pltGotStep: step }),
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
