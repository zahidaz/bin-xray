import type { Elf64Shdr, Elf64Sym } from "./types";
import { isLittleEndian } from "./header";
import type { Elf64Ehdr } from "./types";
import { SHT_SYMTAB, SHT_DYNSYM } from "./constants";
import { getStringAt } from "./strings";

function parseSymbolTable(
  buffer: ArrayBuffer,
  section: Elf64Shdr,
  sections: Elf64Shdr[],
  le: boolean
): Elf64Sym[] {
  const view = new DataView(buffer);
  const offset = Number(section.sh_offset);
  const size = Number(section.sh_size);
  const entsize = Number(section.sh_entsize) || 24;
  const count = Math.floor(size / entsize);
  const symbols: Elf64Sym[] = [];

  const strSection = sections[section.sh_link];
  const strTableOffset = strSection ? Number(strSection.sh_offset) : 0;

  for (let i = 0; i < count; i++) {
    const base = offset + i * entsize;
    if (base + entsize > buffer.byteLength) break;

    const st_name = view.getUint32(base, le);
    const resolvedName = strSection
      ? getStringAt(buffer, strTableOffset, st_name)
      : "";

    symbols.push({
      st_name,
      st_info: view.getUint8(base + 4),
      st_other: view.getUint8(base + 5),
      st_shndx: view.getUint16(base + 6, le),
      st_value: view.getBigUint64(base + 8, le),
      st_size: view.getBigUint64(base + 16, le),
      resolvedName,
      sectionIndex: section.index,
    });
  }

  return symbols;
}

export function parseSymbols(
  buffer: ArrayBuffer,
  header: Elf64Ehdr,
  sections: Elf64Shdr[]
): { symbols: Elf64Sym[]; dynamicSymbols: Elf64Sym[] } {
  const le = isLittleEndian(header);
  let symbols: Elf64Sym[] = [];
  let dynamicSymbols: Elf64Sym[] = [];

  for (const section of sections) {
    if (section.sh_type === SHT_SYMTAB) {
      symbols = parseSymbolTable(buffer, section, sections, le);
    } else if (section.sh_type === SHT_DYNSYM) {
      dynamicSymbols = parseSymbolTable(buffer, section, sections, le);
    }
  }

  return { symbols, dynamicSymbols };
}
