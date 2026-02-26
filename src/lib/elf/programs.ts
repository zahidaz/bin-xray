import type { Elf64Ehdr, Elf64Phdr } from "./types";
import { isLittleEndian } from "./header";

export function parseProgramHeaders(
  buffer: ArrayBuffer,
  header: Elf64Ehdr
): Elf64Phdr[] {
  const le = isLittleEndian(header);
  const view = new DataView(buffer);
  const offset = Number(header.e_phoff);
  const count = header.e_phnum;
  const entsize = header.e_phentsize;
  const programs: Elf64Phdr[] = [];

  for (let i = 0; i < count; i++) {
    const base = offset + i * entsize;
    if (base + entsize > buffer.byteLength) break;

    programs.push({
      p_type: view.getUint32(base, le),
      p_flags: view.getUint32(base + 4, le),
      p_offset: view.getBigUint64(base + 8, le),
      p_vaddr: view.getBigUint64(base + 16, le),
      p_paddr: view.getBigUint64(base + 24, le),
      p_filesz: view.getBigUint64(base + 32, le),
      p_memsz: view.getBigUint64(base + 40, le),
      p_align: view.getBigUint64(base + 48, le),
      index: i,
    });
  }

  return programs;
}
