import type {
  Elf64Ehdr,
  Elf64Phdr,
  Elf64Shdr,
  Region,
  RegionMap,
  RegionType,
} from "./types";

export function sectionNameToRegionType(name: string): RegionType {
  const mapping: Record<string, RegionType> = {
    ".text": "text",
    ".data": "data",
    ".rodata": "rodata",
    ".bss": "bss",
    ".symtab": "symtab",
    ".strtab": "strtab",
    ".dynsym": "dynsym",
    ".dynstr": "dynstr",
    ".dynamic": "dynamic",
    ".plt": "plt",
    ".plt.got": "plt",
    ".plt.sec": "plt",
    ".got": "got",
    ".got.plt": "got-plt",
    ".rela.plt": "rela-plt",
    ".rela.dyn": "rela-dyn",
    ".interp": "interp",
    ".note.ABI-tag": "note",
    ".note.gnu.build-id": "note",
    ".shstrtab": "shstrtab",
    ".init": "init",
    ".fini": "fini",
    ".hash": "hash",
    ".gnu.hash": "gnu-hash",
    ".eh_frame": "eh-frame",
    ".eh_frame_hdr": "eh-frame-hdr",
    ".comment": "comment",
    ".init_array": "init-array",
    ".fini_array": "fini-array",
  };
  return mapping[name] ?? "unknown";
}

export function buildRegionMap(
  header: Elf64Ehdr,
  programs: Elf64Phdr[],
  sections: Elf64Shdr[]
): RegionMap {
  const regions: Region[] = [];

  regions.push({
    start: 0,
    end: header.e_ehsize,
    type: "elf-header",
    name: "ELF Header",
    description: "The ELF file header (Elf64_Ehdr) — first 64 bytes",
  });

  if (header.e_phoff > 0n) {
    const phStart = Number(header.e_phoff);
    const phEnd = phStart + header.e_phnum * header.e_phentsize;
    regions.push({
      start: phStart,
      end: phEnd,
      type: "program-header",
      name: "Program Header Table",
      description: `${header.e_phnum} program headers (Elf64_Phdr)`,
    });
  }

  if (header.e_shoff > 0n) {
    const shStart = Number(header.e_shoff);
    const shEnd = shStart + header.e_shnum * header.e_shentsize;
    regions.push({
      start: shStart,
      end: shEnd,
      type: "section-header",
      name: "Section Header Table",
      description: `${header.e_shnum} section headers (Elf64_Shdr)`,
    });
  }

  for (const section of sections) {
    const start = Number(section.sh_offset);
    const size = Number(section.sh_size);
    if (size === 0 || start === 0) continue;
    const type = sectionNameToRegionType(section.resolvedName);

    regions.push({
      start,
      end: start + size,
      type,
      name: section.resolvedName || `section[${section.index}]`,
      description: `Section ${section.index}: ${section.resolvedName}`,
      sectionIndex: section.index,
    });
  }

  regions.sort((a, b) => a.start - b.start);

  return {
    regions,
    lookup(offset: number): Region | null {
      for (let i = regions.length - 1; i >= 0; i--) {
        const r = regions[i];
        if (offset >= r.start && offset < r.end) return r;
      }
      return null;
    },
    lookupAll(offset: number): Region[] {
      return regions.filter((r) => offset >= r.start && offset < r.end);
    },
  };
}
