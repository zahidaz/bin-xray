import type { StructMeta } from "@/lib/elf/types";
import { E_TYPE, E_MACHINE, ELFCLASS, ELFDATA, ELFOSABI, P_TYPE, SH_TYPE, EI_CLASS, EI_DATA, EI_OSABI } from "@/lib/elf/constants";

export const ELF64_EHDR_META: StructMeta = {
  name: "Elf64_Ehdr",
  size: 64,
  fields: [
    { name: "e_ident[EI_MAG]", offset: 0, size: 4, type: "bytes" },
    {
      name: "e_ident[EI_CLASS]",
      offset: 4,
      size: 1,
      type: "u8",
      decode: (v) => ELFCLASS[Number(v)] ?? "Unknown",
    },
    {
      name: "e_ident[EI_DATA]",
      offset: 5,
      size: 1,
      type: "u8",
      decode: (v) => ELFDATA[Number(v)] ?? "Unknown",
    },
    { name: "e_ident[EI_VERSION]", offset: 6, size: 1, type: "u8" },
    {
      name: "e_ident[EI_OSABI]",
      offset: 7,
      size: 1,
      type: "u8",
      decode: (v) => ELFOSABI[Number(v)] ?? "Unknown",
    },
    { name: "e_ident[EI_ABIVERSION]", offset: 8, size: 1, type: "u8" },
    { name: "e_ident[EI_PAD]", offset: 9, size: 7, type: "bytes" },
    {
      name: "e_type",
      offset: 16,
      size: 2,
      type: "u16",
      decode: (v) => E_TYPE[Number(v)] ?? "Unknown",
    },
    {
      name: "e_machine",
      offset: 18,
      size: 2,
      type: "u16",
      decode: (v) => E_MACHINE[Number(v)] ?? "Unknown",
    },
    { name: "e_version", offset: 20, size: 4, type: "u32" },
    { name: "e_entry", offset: 24, size: 8, type: "u64" },
    { name: "e_phoff", offset: 32, size: 8, type: "u64" },
    { name: "e_shoff", offset: 40, size: 8, type: "u64" },
    { name: "e_flags", offset: 48, size: 4, type: "u32" },
    { name: "e_ehsize", offset: 52, size: 2, type: "u16" },
    { name: "e_phentsize", offset: 54, size: 2, type: "u16" },
    { name: "e_phnum", offset: 56, size: 2, type: "u16" },
    { name: "e_shentsize", offset: 58, size: 2, type: "u16" },
    { name: "e_shnum", offset: 60, size: 2, type: "u16" },
    { name: "e_shstrndx", offset: 62, size: 2, type: "u16" },
  ],
};

export const ELF64_PHDR_META: StructMeta = {
  name: "Elf64_Phdr",
  size: 56,
  fields: [
    {
      name: "p_type",
      offset: 0,
      size: 4,
      type: "u32",
      decode: (v) => P_TYPE[Number(v)] ?? "Unknown",
    },
    { name: "p_flags", offset: 4, size: 4, type: "u32" },
    { name: "p_offset", offset: 8, size: 8, type: "u64" },
    { name: "p_vaddr", offset: 16, size: 8, type: "u64" },
    { name: "p_paddr", offset: 24, size: 8, type: "u64" },
    { name: "p_filesz", offset: 32, size: 8, type: "u64" },
    { name: "p_memsz", offset: 40, size: 8, type: "u64" },
    { name: "p_align", offset: 48, size: 8, type: "u64" },
  ],
};

export const ELF64_SHDR_META: StructMeta = {
  name: "Elf64_Shdr",
  size: 64,
  fields: [
    { name: "sh_name", offset: 0, size: 4, type: "u32" },
    {
      name: "sh_type",
      offset: 4,
      size: 4,
      type: "u32",
      decode: (v) => SH_TYPE[Number(v)] ?? "Unknown",
    },
    { name: "sh_flags", offset: 8, size: 8, type: "u64" },
    { name: "sh_addr", offset: 16, size: 8, type: "u64" },
    { name: "sh_offset", offset: 24, size: 8, type: "u64" },
    { name: "sh_size", offset: 32, size: 8, type: "u64" },
    { name: "sh_link", offset: 40, size: 4, type: "u32" },
    { name: "sh_info", offset: 44, size: 4, type: "u32" },
    { name: "sh_addralign", offset: 48, size: 8, type: "u64" },
    { name: "sh_entsize", offset: 56, size: 8, type: "u64" },
  ],
};

export const ELF64_SYM_META: StructMeta = {
  name: "Elf64_Sym",
  size: 24,
  fields: [
    { name: "st_name", offset: 0, size: 4, type: "u32" },
    { name: "st_info", offset: 4, size: 1, type: "u8" },
    { name: "st_other", offset: 5, size: 1, type: "u8" },
    { name: "st_shndx", offset: 6, size: 2, type: "u16" },
    { name: "st_value", offset: 8, size: 8, type: "u64" },
    { name: "st_size", offset: 16, size: 8, type: "u64" },
  ],
};

export const ELF64_RELA_META: StructMeta = {
  name: "Elf64_Rela",
  size: 24,
  fields: [
    { name: "r_offset", offset: 0, size: 8, type: "u64" },
    { name: "r_info", offset: 8, size: 8, type: "u64" },
    { name: "r_addend", offset: 16, size: 8, type: "u64" },
  ],
};

export const ELF64_DYN_META: StructMeta = {
  name: "Elf64_Dyn",
  size: 16,
  fields: [
    { name: "d_tag", offset: 0, size: 8, type: "u64" },
    { name: "d_val", offset: 8, size: 8, type: "u64" },
  ],
};
