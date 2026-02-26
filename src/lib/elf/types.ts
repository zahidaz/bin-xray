export interface Elf64Ehdr {
  e_ident: Uint8Array;
  e_type: number;
  e_machine: number;
  e_version: number;
  e_entry: bigint;
  e_phoff: bigint;
  e_shoff: bigint;
  e_flags: number;
  e_ehsize: number;
  e_phentsize: number;
  e_phnum: number;
  e_shentsize: number;
  e_shnum: number;
  e_shstrndx: number;
}

export interface Elf64Phdr {
  p_type: number;
  p_flags: number;
  p_offset: bigint;
  p_vaddr: bigint;
  p_paddr: bigint;
  p_filesz: bigint;
  p_memsz: bigint;
  p_align: bigint;
  index: number;
}

export interface Elf64Shdr {
  sh_name: number;
  sh_type: number;
  sh_flags: bigint;
  sh_addr: bigint;
  sh_offset: bigint;
  sh_size: bigint;
  sh_link: number;
  sh_info: number;
  sh_addralign: bigint;
  sh_entsize: bigint;
  index: number;
  resolvedName: string;
}

export interface Elf64Sym {
  st_name: number;
  st_info: number;
  st_other: number;
  st_shndx: number;
  st_value: bigint;
  st_size: bigint;
  resolvedName: string;
  sectionIndex: number;
}

export interface Elf64Rela {
  r_offset: bigint;
  r_info: bigint;
  r_addend: bigint;
  symbolIndex: number;
  relocType: number;
  sectionIndex: number;
}

export interface Elf64Dyn {
  d_tag: bigint;
  d_val: bigint;
  index: number;
}

export type RegionType =
  | "elf-header"
  | "program-header"
  | "section-header"
  | "text"
  | "data"
  | "rodata"
  | "bss"
  | "symtab"
  | "strtab"
  | "dynsym"
  | "dynstr"
  | "dynamic"
  | "plt"
  | "got"
  | "rela-plt"
  | "rela-dyn"
  | "interp"
  | "note"
  | "shstrtab"
  | "init"
  | "fini"
  | "hash"
  | "gnu-hash"
  | "eh-frame"
  | "eh-frame-hdr"
  | "comment"
  | "got-plt"
  | "init-array"
  | "fini-array"
  | "unknown";

export interface Region {
  start: number;
  end: number;
  type: RegionType;
  name: string;
  description: string;
  sectionIndex?: number;
  segmentIndex?: number;
}

export interface RegionMap {
  regions: Region[];
  lookup(offset: number): Region | null;
  lookupAll(offset: number): Region[];
}

export interface ElfFile {
  raw: ArrayBuffer;
  header: Elf64Ehdr;
  programs: Elf64Phdr[];
  sections: Elf64Shdr[];
  symbols: Elf64Sym[];
  dynamicSymbols: Elf64Sym[];
  relocations: Elf64Rela[];
  dynamicEntries: Elf64Dyn[];
  strings: Map<number, Map<number, string>>;
  regions: RegionMap;
  sectionNames: string[];
}

export interface StructFieldMeta {
  name: string;
  offset: number;
  size: number;
  type: "u8" | "u16" | "u32" | "u64" | "bytes";
  decode?: (value: number | bigint) => string;
}

export interface StructMeta {
  name: string;
  size: number;
  fields: StructFieldMeta[];
}
