import { useCallback } from "react";
import { useUiStore } from "../store/ui-store";
import type { StructFieldMeta } from "../elf/types";

export function useStructHighlight(baseOffset: number) {
  const setHighlightRange = useUiStore((s) => s.setHighlightRange);
  const setHoveredField = useUiStore((s) => s.setHoveredField);

  const onFieldHover = useCallback(
    (field: StructFieldMeta | null) => {
      if (field) {
        setHighlightRange({
          start: baseOffset + field.offset,
          end: baseOffset + field.offset + field.size,
          source: "struct-viewer",
        });
        setHoveredField(field.name);
      } else {
        setHighlightRange(null);
        setHoveredField(null);
      }
    },
    [baseOffset, setHighlightRange, setHoveredField]
  );

  const onFieldClick = useCallback(
    (field: StructFieldMeta) => {
      useUiStore.getState().setSelectedOffset(baseOffset + field.offset);
    },
    [baseOffset]
  );

  return { onFieldHover, onFieldClick };
}
