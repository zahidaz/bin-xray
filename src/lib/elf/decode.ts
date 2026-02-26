import {
  ELFCLASS,
  ELFDATA,
  ELFOSABI,
  E_TYPE,
  E_MACHINE,
  P_TYPE,
  SH_TYPE,
  decodePhdrFlags,
  decodeShdrFlags,
  decodeSymBinding,
  decodeSymType,
  R_X86_64_TYPE,
  decodeDtTag,
  EI_CLASS,
  EI_DATA,
  EI_VERSION,
  EI_OSABI,
} from "./constants";
import type { Elf64Ehdr, Elf64Phdr, Elf64Shdr, Elf64Sym, Elf64Rela, Elf64Dyn } from "./types";

export function decodeEhdr(header: Elf64Ehdr) {
  return {
    class: ELFCLASS[header.e_ident[EI_CLASS]] ?? "Unknown",
    data: ELFDATA[header.e_ident[EI_DATA]] ?? "Unknown",
    version: header.e_ident[EI_VERSION] === 1 ? "1 (current)" : "Unknown",
    osabi: ELFOSABI[header.e_ident[EI_OSABI]] ?? "Unknown",
    type: E_TYPE[header.e_type] ?? `Unknown (${header.e_type})`,
    machine: E_MACHINE[header.e_machine] ?? `Unknown (${header.e_machine})`,
    entry: `0x${header.e_entry.toString(16)}`,
    phoff: `0x${header.e_phoff.toString(16)} (${header.e_phoff} bytes)`,
    shoff: `0x${header.e_shoff.toString(16)} (${header.e_shoff} bytes)`,
    phnum: header.e_phnum,
    shnum: header.e_shnum,
    shstrndx: header.e_shstrndx,
  };
}

export function decodePhdr(phdr: Elf64Phdr) {
  return {
    type: P_TYPE[phdr.p_type] ?? `Unknown (0x${phdr.p_type.toString(16)})`,
    flags: decodePhdrFlags(phdr.p_flags),
    offset: `0x${phdr.p_offset.toString(16)}`,
    vaddr: `0x${phdr.p_vaddr.toString(16)}`,
    paddr: `0x${phdr.p_paddr.toString(16)}`,
    filesz: `0x${phdr.p_filesz.toString(16)} (${phdr.p_filesz} bytes)`,
    memsz: `0x${phdr.p_memsz.toString(16)} (${phdr.p_memsz} bytes)`,
    align: `0x${phdr.p_align.toString(16)}`,
  };
}

export function decodeShdr(shdr: Elf64Shdr) {
  return {
    name: shdr.resolvedName || `[${shdr.sh_name}]`,
    type: SH_TYPE[shdr.sh_type] ?? `Unknown (0x${shdr.sh_type.toString(16)})`,
    flags: decodeShdrFlags(shdr.sh_flags),
    addr: `0x${shdr.sh_addr.toString(16)}`,
    offset: `0x${shdr.sh_offset.toString(16)}`,
    size: `0x${shdr.sh_size.toString(16)} (${shdr.sh_size} bytes)`,
    link: shdr.sh_link,
    info: shdr.sh_info,
    addralign: shdr.sh_addralign.toString(),
    entsize: shdr.sh_entsize.toString(),
  };
}

export function decodeSym(sym: Elf64Sym) {
  return {
    name: sym.resolvedName || `[${sym.st_name}]`,
    binding: decodeSymBinding(sym.st_info),
    type: decodeSymType(sym.st_info),
    shndx: sym.st_shndx,
    value: `0x${sym.st_value.toString(16)}`,
    size: sym.st_size.toString(),
  };
}

export function decodeRela(rela: Elf64Rela) {
  return {
    offset: `0x${rela.r_offset.toString(16)}`,
    type: R_X86_64_TYPE[rela.relocType] ?? `Unknown (${rela.relocType})`,
    symbolIndex: rela.symbolIndex,
    addend: rela.r_addend.toString(),
  };
}

export function decodeDyn(dyn: Elf64Dyn) {
  return {
    tag: decodeDtTag(dyn.d_tag),
    value: `0x${dyn.d_val.toString(16)}`,
  };
}

export function formatHex(value: number, pad = 2): string {
  return value.toString(16).padStart(pad, "0");
}

export function formatAddress(value: bigint): string {
  return `0x${value.toString(16).padStart(16, "0")}`;
}

export function formatOffset(value: number, pad = 8): string {
  return value.toString(16).padStart(pad, "0");
}
