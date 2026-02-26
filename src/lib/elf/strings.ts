import type { Elf64Shdr } from "./types";
import { SHT_STRTAB } from "./constants";

export function parseStringTables(
  buffer: ArrayBuffer,
  sections: Elf64Shdr[]
): Map<number, Map<number, string>> {
  const tables = new Map<number, Map<number, string>>();
  const bytes = new Uint8Array(buffer);

  for (const section of sections) {
    if (section.sh_type !== SHT_STRTAB) continue;

    const offset = Number(section.sh_offset);
    const size = Number(section.sh_size);
    const table = new Map<number, string>();

    let strStart = 0;
    for (let i = 0; i <= size; i++) {
      if (i === size || bytes[offset + i] === 0) {
        if (i > strStart) {
          const str = new TextDecoder().decode(
            bytes.slice(offset + strStart, offset + i)
          );
          table.set(strStart, str);
        } else {
          table.set(strStart, "");
        }
        strStart = i + 1;
      }
    }

    tables.set(section.index, table);
  }

  return tables;
}

export function getStringAt(
  buffer: ArrayBuffer,
  tableOffset: number,
  nameOffset: number
): string {
  const bytes = new Uint8Array(buffer);
  const start = tableOffset + nameOffset;
  let end = start;
  while (end < bytes.length && bytes[end] !== 0) {
    end++;
  }
  return new TextDecoder().decode(bytes.slice(start, end));
}
