import type { Elf64Ehdr, Elf64Shdr } from "./types";
import { isLittleEndian } from "./header";
import { getStringAt } from "./strings";

export function parseSectionHeaders(
  buffer: ArrayBuffer,
  header: Elf64Ehdr
): Elf64Shdr[] {
  const le = isLittleEndian(header);
  const view = new DataView(buffer);
  const offset = Number(header.e_shoff);
  const count = header.e_shnum;
  const entsize = header.e_shentsize;
  const sections: Elf64Shdr[] = [];

  if (offset === 0 || count === 0) return sections;

  for (let i = 0; i < count; i++) {
    const base = offset + i * entsize;
    if (base + entsize > buffer.byteLength) break;

    sections.push({
      sh_name: view.getUint32(base, le),
      sh_type: view.getUint32(base + 4, le),
      sh_flags: view.getBigUint64(base + 8, le),
      sh_addr: view.getBigUint64(base + 16, le),
      sh_offset: view.getBigUint64(base + 24, le),
      sh_size: view.getBigUint64(base + 32, le),
      sh_link: view.getUint32(base + 40, le),
      sh_info: view.getUint32(base + 44, le),
      sh_addralign: view.getBigUint64(base + 48, le),
      sh_entsize: view.getBigUint64(base + 56, le),
      index: i,
      resolvedName: "",
    });
  }

  return sections;
}

export function resolveSectionNames(
  buffer: ArrayBuffer,
  sections: Elf64Shdr[],
  shstrndx: number
): string[] {
  if (shstrndx === 0 || shstrndx >= sections.length) {
    return sections.map(() => "");
  }

  const shstrtab = sections[shstrndx];
  const tableOffset = Number(shstrtab.sh_offset);
  const names: string[] = [];

  for (const section of sections) {
    const name = getStringAt(buffer, tableOffset, section.sh_name);
    section.resolvedName = name;
    names.push(name);
  }

  return names;
}
