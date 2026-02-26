import type { Elf64Ehdr, Elf64Rela, Elf64Shdr } from "./types";
import { isLittleEndian } from "./header";
import { SHT_RELA } from "./constants";

export function parseRelocations(
  buffer: ArrayBuffer,
  header: Elf64Ehdr,
  sections: Elf64Shdr[]
): Elf64Rela[] {
  const le = isLittleEndian(header);
  const view = new DataView(buffer);
  const relocations: Elf64Rela[] = [];

  for (const section of sections) {
    if (section.sh_type !== SHT_RELA) continue;

    const offset = Number(section.sh_offset);
    const size = Number(section.sh_size);
    const entsize = Number(section.sh_entsize) || 24;
    const count = Math.floor(size / entsize);

    for (let i = 0; i < count; i++) {
      const base = offset + i * entsize;
      if (base + entsize > buffer.byteLength) break;

      const r_info = view.getBigUint64(base + 8, le);

      relocations.push({
        r_offset: view.getBigUint64(base, le),
        r_info,
        r_addend: view.getBigInt64(base + 16, le),
        symbolIndex: Number(r_info >> 32n),
        relocType: Number(r_info & 0xffffffffn),
        sectionIndex: section.index,
      });
    }
  }

  return relocations;
}
