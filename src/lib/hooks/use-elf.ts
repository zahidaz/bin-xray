import { useEffect } from "react";
import { useBinaryStore } from "../store/binary-store";

export function useElf(sampleName?: string) {
  const { parsed, loading, error, loadSample, fileName } = useBinaryStore();

  useEffect(() => {
    if (sampleName && !parsed && !loading) {
      loadSample(sampleName);
    }
  }, [sampleName, parsed, loading, loadSample]);

  return { elf: parsed, loading, error, fileName };
}
