import type { Elf64Dyn, Elf64Ehdr, Elf64Shdr } from "./types";
import { isLittleEndian } from "./header";
import { SHT_DYNAMIC } from "./constants";

export function parseDynamic(
  buffer: ArrayBuffer,
  header: Elf64Ehdr,
  sections: Elf64Shdr[]
): Elf64Dyn[] {
  const le = isLittleEndian(header);
  const view = new DataView(buffer);
  const entries: Elf64Dyn[] = [];

  const dynSection = sections.find((s) => s.sh_type === SHT_DYNAMIC);
  if (!dynSection) return entries;

  const offset = Number(dynSection.sh_offset);
  const size = Number(dynSection.sh_size);
  const entsize = Number(dynSection.sh_entsize) || 16;
  const count = Math.floor(size / entsize);

  for (let i = 0; i < count; i++) {
    const base = offset + i * entsize;
    if (base + entsize > buffer.byteLength) break;

    const d_tag = view.getBigInt64(base, le);
    if (d_tag === 0n) {
      entries.push({ d_tag: 0n, d_val: 0n, index: i });
      break;
    }

    entries.push({
      d_tag: BigInt(d_tag),
      d_val: view.getBigUint64(base + 8, le),
      index: i,
    });
  }

  return entries;
}
