import type { Elf64Ehdr } from "./types";
import { ELFMAG, EI_CLASS, EI_DATA } from "./constants";

export function parseElfHeader(buffer: ArrayBuffer): Elf64Ehdr {
  const bytes = new Uint8Array(buffer);

  if (
    bytes[0] !== ELFMAG[0] ||
    bytes[1] !== ELFMAG[1] ||
    bytes[2] !== ELFMAG[2] ||
    bytes[3] !== ELFMAG[3]
  ) {
    throw new Error("Not an ELF file: invalid magic number");
  }

  if (bytes[EI_CLASS] !== 2) {
    throw new Error("Only 64-bit ELF files are supported");
  }

  const littleEndian = bytes[EI_DATA] === 1;
  const view = new DataView(buffer);
  const e_ident = bytes.slice(0, 16);

  return {
    e_ident,
    e_type: view.getUint16(16, littleEndian),
    e_machine: view.getUint16(18, littleEndian),
    e_version: view.getUint32(20, littleEndian),
    e_entry: view.getBigUint64(24, littleEndian),
    e_phoff: view.getBigUint64(32, littleEndian),
    e_shoff: view.getBigUint64(40, littleEndian),
    e_flags: view.getUint32(48, littleEndian),
    e_ehsize: view.getUint16(52, littleEndian),
    e_phentsize: view.getUint16(54, littleEndian),
    e_phnum: view.getUint16(56, littleEndian),
    e_shentsize: view.getUint16(58, littleEndian),
    e_shnum: view.getUint16(60, littleEndian),
    e_shstrndx: view.getUint16(62, littleEndian),
  };
}

export function isLittleEndian(header: Elf64Ehdr): boolean {
  return header.e_ident[EI_DATA] === 1;
}
