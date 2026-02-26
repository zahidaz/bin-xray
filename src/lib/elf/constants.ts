export const EI_MAG0 = 0;
export const EI_MAG1 = 1;
export const EI_MAG2 = 2;
export const EI_MAG3 = 3;
export const EI_CLASS = 4;
export const EI_DATA = 5;
export const EI_VERSION = 6;
export const EI_OSABI = 7;
export const EI_ABIVERSION = 8;
export const EI_NIDENT = 16;

export const ELFMAG = [0x7f, 0x45, 0x4c, 0x46];

export const ELFCLASS: Record<number, string> = {
  0: "ELFCLASSNONE",
  1: "ELFCLASS32",
  2: "ELFCLASS64",
};

export const ELFDATA: Record<number, string> = {
  0: "ELFDATANONE",
  1: "ELFDATA2LSB (Little Endian)",
  2: "ELFDATA2MSB (Big Endian)",
};

export const ELFOSABI: Record<number, string> = {
  0: "ELFOSABI_NONE / System V",
  1: "ELFOSABI_HPUX",
  2: "ELFOSABI_NETBSD",
  3: "ELFOSABI_GNU / Linux",
  6: "ELFOSABI_SOLARIS",
  7: "ELFOSABI_AIX",
  8: "ELFOSABI_IRIX",
  9: "ELFOSABI_FREEBSD",
  10: "ELFOSABI_TRU64",
  11: "ELFOSABI_MODESTO",
  12: "ELFOSABI_OPENBSD",
  255: "ELFOSABI_STANDALONE",
};

export const ET_NONE = 0;
export const ET_REL = 1;
export const ET_EXEC = 2;
export const ET_DYN = 3;
export const ET_CORE = 4;

export const E_TYPE: Record<number, string> = {
  [ET_NONE]: "ET_NONE (No file type)",
  [ET_REL]: "ET_REL (Relocatable)",
  [ET_EXEC]: "ET_EXEC (Executable)",
  [ET_DYN]: "ET_DYN (Shared object)",
  [ET_CORE]: "ET_CORE (Core file)",
};

export const E_MACHINE: Record<number, string> = {
  0: "EM_NONE",
  2: "EM_SPARC",
  3: "EM_386 (Intel 80386)",
  8: "EM_MIPS",
  20: "EM_PPC",
  21: "EM_PPC64",
  40: "EM_ARM",
  43: "EM_SPARCV9",
  62: "EM_X86_64 (AMD x86-64)",
  183: "EM_AARCH64 (ARM AARCH64)",
  243: "EM_RISCV",
};

export const PT_NULL = 0;
export const PT_LOAD = 1;
export const PT_DYNAMIC = 2;
export const PT_INTERP = 3;
export const PT_NOTE = 4;
export const PT_SHLIB = 5;
export const PT_PHDR = 6;
export const PT_TLS = 7;
export const PT_GNU_EH_FRAME = 0x6474e550;
export const PT_GNU_STACK = 0x6474e551;
export const PT_GNU_RELRO = 0x6474e552;
export const PT_GNU_PROPERTY = 0x6474e553;

export const P_TYPE: Record<number, string> = {
  [PT_NULL]: "PT_NULL",
  [PT_LOAD]: "PT_LOAD",
  [PT_DYNAMIC]: "PT_DYNAMIC",
  [PT_INTERP]: "PT_INTERP",
  [PT_NOTE]: "PT_NOTE",
  [PT_SHLIB]: "PT_SHLIB",
  [PT_PHDR]: "PT_PHDR",
  [PT_TLS]: "PT_TLS",
  [PT_GNU_EH_FRAME]: "PT_GNU_EH_FRAME",
  [PT_GNU_STACK]: "PT_GNU_STACK",
  [PT_GNU_RELRO]: "PT_GNU_RELRO",
  [PT_GNU_PROPERTY]: "PT_GNU_PROPERTY",
};

export const PF_X = 0x1;
export const PF_W = 0x2;
export const PF_R = 0x4;

export function decodePhdrFlags(flags: number): string {
  const parts: string[] = [];
  if (flags & PF_R) parts.push("R");
  if (flags & PF_W) parts.push("W");
  if (flags & PF_X) parts.push("E");
  return parts.join("") || "---";
}

export const SHT_NULL = 0;
export const SHT_PROGBITS = 1;
export const SHT_SYMTAB = 2;
export const SHT_STRTAB = 3;
export const SHT_RELA = 4;
export const SHT_HASH = 5;
export const SHT_DYNAMIC = 6;
export const SHT_NOTE = 7;
export const SHT_NOBITS = 8;
export const SHT_REL = 9;
export const SHT_SHLIB = 10;
export const SHT_DYNSYM = 11;
export const SHT_INIT_ARRAY = 14;
export const SHT_FINI_ARRAY = 15;
export const SHT_GNU_HASH = 0x6ffffff6;
export const SHT_GNU_VERSYM = 0x6fffffff;
export const SHT_GNU_VERNEED = 0x6ffffffe;
export const SHT_GNU_VERDEF = 0x6ffffffd;

export const SH_TYPE: Record<number, string> = {
  [SHT_NULL]: "SHT_NULL",
  [SHT_PROGBITS]: "SHT_PROGBITS",
  [SHT_SYMTAB]: "SHT_SYMTAB",
  [SHT_STRTAB]: "SHT_STRTAB",
  [SHT_RELA]: "SHT_RELA",
  [SHT_HASH]: "SHT_HASH",
  [SHT_DYNAMIC]: "SHT_DYNAMIC",
  [SHT_NOTE]: "SHT_NOTE",
  [SHT_NOBITS]: "SHT_NOBITS",
  [SHT_REL]: "SHT_REL",
  [SHT_SHLIB]: "SHT_SHLIB",
  [SHT_DYNSYM]: "SHT_DYNSYM",
  [SHT_INIT_ARRAY]: "SHT_INIT_ARRAY",
  [SHT_FINI_ARRAY]: "SHT_FINI_ARRAY",
  [SHT_GNU_HASH]: "SHT_GNU_HASH",
  [SHT_GNU_VERSYM]: "SHT_GNU_VERSYM",
  [SHT_GNU_VERNEED]: "SHT_GNU_VERNEED",
  [SHT_GNU_VERDEF]: "SHT_GNU_VERDEF",
};

export const SHF_WRITE = 0x1;
export const SHF_ALLOC = 0x2;
export const SHF_EXECINSTR = 0x4;
export const SHF_MERGE = 0x10;
export const SHF_STRINGS = 0x20;
export const SHF_INFO_LINK = 0x40;
export const SHF_GROUP = 0x200;
export const SHF_TLS = 0x400;

export function decodeShdrFlags(flags: bigint): string {
  const parts: string[] = [];
  const f = Number(flags);
  if (f & SHF_WRITE) parts.push("W");
  if (f & SHF_ALLOC) parts.push("A");
  if (f & SHF_EXECINSTR) parts.push("X");
  if (f & SHF_MERGE) parts.push("M");
  if (f & SHF_STRINGS) parts.push("S");
  if (f & SHF_INFO_LINK) parts.push("I");
  if (f & SHF_GROUP) parts.push("G");
  if (f & SHF_TLS) parts.push("T");
  return parts.join("") || "---";
}

export const STB_LOCAL = 0;
export const STB_GLOBAL = 1;
export const STB_WEAK = 2;

export const STB_BINDING: Record<number, string> = {
  [STB_LOCAL]: "LOCAL",
  [STB_GLOBAL]: "GLOBAL",
  [STB_WEAK]: "WEAK",
};

export const STT_NOTYPE = 0;
export const STT_OBJECT = 1;
export const STT_FUNC = 2;
export const STT_SECTION = 3;
export const STT_FILE = 4;
export const STT_COMMON = 5;
export const STT_TLS = 6;

export const STT_TYPE: Record<number, string> = {
  [STT_NOTYPE]: "NOTYPE",
  [STT_OBJECT]: "OBJECT",
  [STT_FUNC]: "FUNC",
  [STT_SECTION]: "SECTION",
  [STT_FILE]: "FILE",
  [STT_COMMON]: "COMMON",
  [STT_TLS]: "TLS",
};

export const SHN_UNDEF = 0;
export const SHN_ABS = 0xfff1;
export const SHN_COMMON = 0xfff2;

export function decodeSymBinding(info: number): string {
  return STB_BINDING[info >> 4] ?? `UNKNOWN(${info >> 4})`;
}

export function decodeSymType(info: number): string {
  return STT_TYPE[info & 0xf] ?? `UNKNOWN(${info & 0xf})`;
}

export const R_X86_64_NONE = 0;
export const R_X86_64_64 = 1;
export const R_X86_64_PC32 = 2;
export const R_X86_64_GOT32 = 3;
export const R_X86_64_PLT32 = 4;
export const R_X86_64_GLOB_DAT = 6;
export const R_X86_64_JUMP_SLOT = 7;
export const R_X86_64_RELATIVE = 8;

export const R_X86_64_TYPE: Record<number, string> = {
  [R_X86_64_NONE]: "R_X86_64_NONE",
  [R_X86_64_64]: "R_X86_64_64",
  [R_X86_64_PC32]: "R_X86_64_PC32",
  [R_X86_64_GOT32]: "R_X86_64_GOT32",
  [R_X86_64_PLT32]: "R_X86_64_PLT32",
  [R_X86_64_GLOB_DAT]: "R_X86_64_GLOB_DAT",
  [R_X86_64_JUMP_SLOT]: "R_X86_64_JUMP_SLOT",
  [R_X86_64_RELATIVE]: "R_X86_64_RELATIVE",
};

export const DT_NULL = 0n;
export const DT_NEEDED = 1n;
export const DT_PLTRELSZ = 2n;
export const DT_PLTGOT = 3n;
export const DT_HASH = 4n;
export const DT_STRTAB = 5n;
export const DT_SYMTAB = 6n;
export const DT_RELA = 7n;
export const DT_RELASZ = 8n;
export const DT_RELAENT = 9n;
export const DT_STRSZ = 10n;
export const DT_SYMENT = 11n;
export const DT_INIT = 12n;
export const DT_FINI = 13n;
export const DT_SONAME = 14n;
export const DT_RPATH = 15n;
export const DT_SYMBOLIC = 16n;
export const DT_REL = 17n;
export const DT_RELSZ = 18n;
export const DT_RELENT = 19n;
export const DT_PLTREL = 20n;
export const DT_DEBUG = 21n;
export const DT_JMPREL = 23n;
export const DT_BIND_NOW = 24n;
export const DT_FLAGS = 30n;
export const DT_FLAGS_1 = 0x6ffffffbn;
export const DT_VERNEED = 0x6ffffffen;
export const DT_VERNEEDNUM = 0x6fffffffn;
export const DT_GNU_HASH = 0x6ffffef5n;
export const DT_RELACOUNT = 0x6ffffff9n;

export const DT_TAG: Record<string, string> = {
  "0": "DT_NULL",
  "1": "DT_NEEDED",
  "2": "DT_PLTRELSZ",
  "3": "DT_PLTGOT",
  "4": "DT_HASH",
  "5": "DT_STRTAB",
  "6": "DT_SYMTAB",
  "7": "DT_RELA",
  "8": "DT_RELASZ",
  "9": "DT_RELAENT",
  "10": "DT_STRSZ",
  "11": "DT_SYMENT",
  "12": "DT_INIT",
  "13": "DT_FINI",
  "14": "DT_SONAME",
  "15": "DT_RPATH",
  "16": "DT_SYMBOLIC",
  "17": "DT_REL",
  "18": "DT_RELSZ",
  "19": "DT_RELENT",
  "20": "DT_PLTREL",
  "21": "DT_DEBUG",
  "23": "DT_JMPREL",
  "24": "DT_BIND_NOW",
  "30": "DT_FLAGS",
};

export function decodeDtTag(tag: bigint): string {
  return DT_TAG[tag.toString()] ?? `0x${tag.toString(16)}`;
}
