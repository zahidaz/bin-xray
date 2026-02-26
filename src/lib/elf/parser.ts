import type { ElfFile } from "./types";
import { parseElfHeader } from "./header";
import { parseProgramHeaders } from "./programs";
import { parseSectionHeaders, resolveSectionNames } from "./sections";
import { parseSymbols } from "./symbols";
import { parseStringTables } from "./strings";
import { parseRelocations } from "./relocations";
import { parseDynamic } from "./dynamic";
import { buildRegionMap } from "./regions";

export function parseElf(buffer: ArrayBuffer): ElfFile {
  const header = parseElfHeader(buffer);
  const programs = parseProgramHeaders(buffer, header);
  const sections = parseSectionHeaders(buffer, header);
  const sectionNames = resolveSectionNames(
    buffer,
    sections,
    header.e_shstrndx
  );
  const strings = parseStringTables(buffer, sections);
  const { symbols, dynamicSymbols } = parseSymbols(buffer, header, sections);
  const relocations = parseRelocations(buffer, header, sections);
  const dynamicEntries = parseDynamic(buffer, header, sections);
  const regions = buildRegionMap(header, programs, sections);

  return {
    raw: buffer,
    header,
    programs,
    sections,
    symbols,
    dynamicSymbols,
    relocations,
    dynamicEntries,
    strings,
    regions,
    sectionNames,
  };
}
