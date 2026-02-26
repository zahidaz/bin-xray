const fs = require("fs");
const path = require("path");

function u8(v: number) {
  return [v & 0xff];
}
function u16le(v: number) {
  return [v & 0xff, (v >> 8) & 0xff];
}
function u32le(v: number) {
  return [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff];
}
function u64le(v: number) {
  const lo = v & 0xffffffff;
  const hi = Math.floor(v / 0x100000000) & 0xffffffff;
  return [...u32le(lo), ...u32le(hi)];
}

function strBytes(s: string) {
  return Array.from(Buffer.from(s + "\0"));
}

function pad(data: number[], alignment: number) {
  const rem = data.length % alignment;
  if (rem === 0) return data;
  return [...data, ...new Array(alignment - rem).fill(0)];
}

const EHDR_SIZE = 64;
const PHDR_SIZE = 56;
const SHDR_SIZE = 64;

const textCode = [
  0xf3, 0x0f, 0x1e, 0xfa,
  0x55,
  0x48, 0x89, 0xe5,
  0x48, 0x8d, 0x3d, 0x00, 0x00, 0x00, 0x00,
  0xe8, 0x00, 0x00, 0x00, 0x00,
  0xb8, 0x00, 0x00, 0x00, 0x00,
  0x5d,
  0xc3,
  0xf3, 0x0f, 0x1e, 0xfa,
  0x55,
  0x48, 0x89, 0xe5,
  0x48, 0x8d, 0x3d, 0x00, 0x00, 0x00, 0x00,
  0xe8, 0x00, 0x00, 0x00, 0x00,
  0x48, 0x8d, 0x3d, 0x00, 0x00, 0x00, 0x00,
  0x8b, 0x35, 0x00, 0x00, 0x00, 0x00,
  0xb8, 0x00, 0x00, 0x00, 0x00,
  0xe8, 0x00, 0x00, 0x00, 0x00,
  0xb8, 0x00, 0x00, 0x00, 0x00,
  0x5d,
  0xc3,
];

const rodataStr = [
  ...strBytes("Hello, ELF Explorer!"),
  ...strBytes("Result: %d\n"),
  ...strBytes("Counter: %d\n"),
];

const dataSection = [
  ...u64le(0),
  0x2a, 0x00, 0x00, 0x00,
];

const pltCode = [
  0xff, 0x35, 0x00, 0x00, 0x00, 0x00,
  0xff, 0x25, 0x00, 0x00, 0x00, 0x00,
  0x0f, 0x1f, 0x40, 0x00,

  0xff, 0x25, 0x00, 0x00, 0x00, 0x00,
  0x68, 0x00, 0x00, 0x00, 0x00,
  0xe9, 0x00, 0x00, 0x00, 0x00,
];

const gotPlt = [
  ...u64le(0),
  ...u64le(0),
  ...u64le(0),
  ...u64le(0),
];

const interpStr = strBytes("/lib64/ld-linux-x86-64.so.2");

const shstrtab = [
  0,
  ...strBytes(".text"),
  ...strBytes(".rodata"),
  ...strBytes(".data"),
  ...strBytes(".bss"),
  ...strBytes(".symtab"),
  ...strBytes(".strtab"),
  ...strBytes(".shstrtab"),
  ...strBytes(".plt"),
  ...strBytes(".got.plt"),
  ...strBytes(".interp"),
  ...strBytes(".dynamic"),
  ...strBytes(".dynsym"),
  ...strBytes(".dynstr"),
  ...strBytes(".rela.plt"),
];

function findInShstrtab(name: string): number {
  const bytes = Buffer.from(shstrtab);
  const target = Buffer.from(name + "\0");
  const idx = bytes.indexOf(target);
  return idx >= 0 ? idx : 0;
}

const strtab = [
  0,
  ...strBytes("hello.c"),
  ...strBytes("main"),
  ...strBytes("print_greeting"),
  ...strBytes("compute"),
  ...strBytes("add"),
  ...strBytes("greeting"),
  ...strBytes("magic_number"),
  ...strBytes("global_counter"),
  ...strBytes("global_buffer"),
  ...strBytes("printf"),
];

function findInStrtab(name: string): number {
  const bytes = Buffer.from(strtab);
  const target = Buffer.from(name + "\0");
  const idx = bytes.indexOf(target);
  return idx >= 0 ? idx : 0;
}

const dynstr = [
  0,
  ...strBytes("printf"),
  ...strBytes("libc.so.6"),
  ...strBytes("GLIBC_2.2.5"),
];

function findInDynstr(name: string): number {
  const bytes = Buffer.from(dynstr);
  const target = Buffer.from(name + "\0");
  const idx = bytes.indexOf(target);
  return idx >= 0 ? idx : 0;
}

const NUM_PHDRS = 6;
const NUM_SECTIONS = 15;

const phdrTableOffset = EHDR_SIZE;
const phdrTableSize = NUM_PHDRS * PHDR_SIZE;

let offset = EHDR_SIZE + phdrTableSize;
offset = Math.ceil(offset / 16) * 16;

const interpOffset = offset;
offset += interpStr.length;
offset = Math.ceil(offset / 16) * 16;

const textOffset = offset;
offset += textCode.length;
offset = Math.ceil(offset / 16) * 16;

const pltOffset = offset;
offset += pltCode.length;
offset = Math.ceil(offset / 16) * 16;

const rodataOffset = offset;
offset += rodataStr.length;
offset = Math.ceil(offset / 16) * 16;

const dataOffset = offset;
offset += dataSection.length;
offset = Math.ceil(offset / 16) * 16;

const gotPltOffset = offset;
offset += gotPlt.length;
offset = Math.ceil(offset / 16) * 16;

const dynamicEntries = [
  [...u64le(1), ...u64le(findInDynstr("libc.so.6"))],
  [...u64le(5), ...u64le(0x400000 + 0)],
  [...u64le(6), ...u64le(0x400000 + 0)],
  [...u64le(0), ...u64le(0)],
];
const dynamicSection = dynamicEntries.flat();
const dynamicOffset = offset;
offset += dynamicSection.length;
offset = Math.ceil(offset / 16) * 16;

function symEntry(
  name: number,
  info: number,
  other: number,
  shndx: number,
  value: number,
  size: number
) {
  return [
    ...u32le(name),
    ...u8(info),
    ...u8(other),
    ...u16le(shndx),
    ...u64le(value),
    ...u64le(size),
  ];
}

const dynsymSection = [
  ...symEntry(0, 0, 0, 0, 0, 0),
  ...symEntry(findInDynstr("printf"), 0x12, 0, 0, 0, 0),
];
const dynsymOffset = offset;
offset += dynsymSection.length;
offset = Math.ceil(offset / 16) * 16;

const dynstrOffset = offset;
offset += dynstr.length;
offset = Math.ceil(offset / 16) * 16;

const relaPltEntry = [
  ...u64le(0x400000 + gotPltOffset + 24),
  ...u64le((1 << 32) | 7),
  ...u64le(0),
];
const relaPltOffset = offset;
offset += relaPltEntry.length;
offset = Math.ceil(offset / 16) * 16;

const symtabSection = [
  ...symEntry(0, 0, 0, 0, 0, 0),
  ...symEntry(findInStrtab("hello.c"), 0x04, 0, 0xfff1, 0, 0),
  ...symEntry(findInStrtab("main"), 0x12, 0, 1, 0x400000 + textOffset, textCode.length),
  ...symEntry(findInStrtab("print_greeting"), 0x12, 0, 1, 0x400000 + textOffset + 27, 40),
  ...symEntry(findInStrtab("compute"), 0x12, 0, 1, 0x400000 + textOffset + 67, 20),
  ...symEntry(findInStrtab("add"), 0x02, 0, 1, 0x400000 + textOffset + 87, 10),
  ...symEntry(findInStrtab("greeting"), 0x11, 0, 4, 0x400000 + dataOffset, 8),
  ...symEntry(findInStrtab("magic_number"), 0x11, 0, 4, 0x400000 + dataOffset + 8, 4),
  ...symEntry(findInStrtab("global_counter"), 0x11, 0, 5, 0x400000 + dataOffset + 12, 4),
  ...symEntry(findInStrtab("global_buffer"), 0x11, 0, 5, 0, 256),
];
const symtabOffset = offset;
offset += symtabSection.length;
offset = Math.ceil(offset / 16) * 16;

const strtabOffset = offset;
offset += strtab.length;
offset = Math.ceil(offset / 16) * 16;

const shstrtabOffset = offset;
offset += shstrtab.length;
offset = Math.ceil(offset / 16) * 16;

const shdrTableOffset = offset;
const totalSize = shdrTableOffset + NUM_SECTIONS * SHDR_SIZE;

const BSS_SIZE = 260;

function makeShdr(
  nameIdx: number,
  type: number,
  flags: number,
  addr: number,
  fileOffset: number,
  size: number,
  link: number,
  info: number,
  addralign: number,
  entsize: number
) {
  return [
    ...u32le(nameIdx),
    ...u32le(type),
    ...u64le(flags),
    ...u64le(addr),
    ...u64le(fileOffset),
    ...u64le(size),
    ...u32le(link),
    ...u32le(info),
    ...u64le(addralign),
    ...u64le(entsize),
  ];
}

const SHT_NULL = 0;
const SHT_PROGBITS = 1;
const SHT_SYMTAB = 2;
const SHT_STRTAB = 3;
const SHT_RELA = 4;
const SHT_DYNAMIC = 6;
const SHT_NOBITS = 8;
const SHT_DYNSYM = 11;

const SHF_WRITE = 1;
const SHF_ALLOC = 2;
const SHF_EXECINSTR = 4;

const sectionHeaders = [
  makeShdr(0, SHT_NULL, 0, 0, 0, 0, 0, 0, 0, 0),
  makeShdr(findInShstrtab(".text"), SHT_PROGBITS, SHF_ALLOC | SHF_EXECINSTR, 0x400000 + textOffset, textOffset, textCode.length, 0, 0, 16, 0),
  makeShdr(findInShstrtab(".plt"), SHT_PROGBITS, SHF_ALLOC | SHF_EXECINSTR, 0x400000 + pltOffset, pltOffset, pltCode.length, 0, 0, 16, 16),
  makeShdr(findInShstrtab(".rodata"), SHT_PROGBITS, SHF_ALLOC, 0x400000 + rodataOffset, rodataOffset, rodataStr.length, 0, 0, 4, 0),
  makeShdr(findInShstrtab(".data"), SHT_PROGBITS, SHF_WRITE | SHF_ALLOC, 0x400000 + dataOffset, dataOffset, dataSection.length, 0, 0, 8, 0),
  makeShdr(findInShstrtab(".bss"), SHT_NOBITS, SHF_WRITE | SHF_ALLOC, 0x400000 + dataOffset + dataSection.length, dataOffset + dataSection.length, BSS_SIZE, 0, 0, 32, 0),
  makeShdr(findInShstrtab(".got.plt"), SHT_PROGBITS, SHF_WRITE | SHF_ALLOC, 0x400000 + gotPltOffset, gotPltOffset, gotPlt.length, 0, 0, 8, 8),
  makeShdr(findInShstrtab(".dynamic"), SHT_DYNAMIC, SHF_WRITE | SHF_ALLOC, 0x400000 + dynamicOffset, dynamicOffset, dynamicSection.length, 13, 0, 8, 16),
  makeShdr(findInShstrtab(".interp"), SHT_PROGBITS, SHF_ALLOC, 0x400000 + interpOffset, interpOffset, interpStr.length, 0, 0, 1, 0),
  makeShdr(findInShstrtab(".dynsym"), SHT_DYNSYM, SHF_ALLOC, 0x400000 + dynsymOffset, dynsymOffset, dynsymSection.length, 13, 1, 8, 24),
  makeShdr(findInShstrtab(".rela.plt"), SHT_RELA, SHF_ALLOC, 0x400000 + relaPltOffset, relaPltOffset, relaPltEntry.length, 9, 6, 8, 24),
  makeShdr(findInShstrtab(".symtab"), SHT_SYMTAB, 0, 0, symtabOffset, symtabSection.length, 12, 2, 8, 24),
  makeShdr(findInShstrtab(".strtab"), SHT_STRTAB, 0, 0, strtabOffset, strtab.length, 0, 0, 1, 0),
  makeShdr(findInShstrtab(".dynstr"), SHT_STRTAB, SHF_ALLOC, 0x400000 + dynstrOffset, dynstrOffset, dynstr.length, 0, 0, 1, 0),
  makeShdr(findInShstrtab(".shstrtab"), SHT_STRTAB, 0, 0, shstrtabOffset, shstrtab.length, 0, 0, 1, 0),
];

const PF_X = 1;
const PF_W = 2;
const PF_R = 4;
const PT_LOAD = 1;
const PT_DYNAMIC = 2;
const PT_INTERP = 3;
const PT_PHDR = 6;
const PT_GNU_STACK = 0x6474e551;

function makePhdr(
  type: number,
  flags: number,
  fileOffset: number,
  vaddr: number,
  filesz: number,
  memsz: number,
  align: number
) {
  return [
    ...u32le(type),
    ...u32le(flags),
    ...u64le(fileOffset),
    ...u64le(vaddr),
    ...u64le(vaddr),
    ...u64le(filesz),
    ...u64le(memsz),
    ...u64le(align),
  ];
}

const rwDataEnd = dataOffset + dataSection.length + BSS_SIZE;

const programHeaders = [
  makePhdr(PT_PHDR, PF_R, phdrTableOffset, 0x400000 + phdrTableOffset, phdrTableSize, phdrTableSize, 8),
  makePhdr(PT_INTERP, PF_R, interpOffset, 0x400000 + interpOffset, interpStr.length, interpStr.length, 1),
  makePhdr(PT_LOAD, PF_R | PF_X, 0, 0x400000, pltOffset + pltCode.length, pltOffset + pltCode.length, 0x1000),
  makePhdr(PT_LOAD, PF_R | PF_W, dataOffset, 0x400000 + dataOffset, dataSection.length + gotPlt.length + dynamicSection.length, dataSection.length + gotPlt.length + dynamicSection.length + BSS_SIZE, 0x1000),
  makePhdr(PT_DYNAMIC, PF_R | PF_W, dynamicOffset, 0x400000 + dynamicOffset, dynamicSection.length, dynamicSection.length, 8),
  makePhdr(PT_GNU_STACK, PF_R | PF_W, 0, 0, 0, 0, 16),
];

const elfHeader = [
  0x7f, 0x45, 0x4c, 0x46,
  0x02,
  0x01,
  0x01,
  0x00,
  0x00,
  ...new Array(7).fill(0),
  ...u16le(0x02),
  ...u16le(0x3e),
  ...u32le(1),
  ...u64le(0x400000 + textOffset),
  ...u64le(phdrTableOffset),
  ...u64le(shdrTableOffset),
  ...u32le(0),
  ...u16le(EHDR_SIZE),
  ...u16le(PHDR_SIZE),
  ...u16le(NUM_PHDRS),
  ...u16le(SHDR_SIZE),
  ...u16le(NUM_SECTIONS),
  ...u16le(14),
];

const binary = new Uint8Array(totalSize);

function write(offset: number, data: number[]) {
  for (let i = 0; i < data.length; i++) {
    if (offset + i < binary.length) {
      binary[offset + i] = data[i];
    }
  }
}

write(0, elfHeader);

for (let i = 0; i < programHeaders.length; i++) {
  write(phdrTableOffset + i * PHDR_SIZE, programHeaders[i]);
}

write(interpOffset, interpStr);
write(textOffset, textCode);
write(pltOffset, pltCode);
write(rodataOffset, rodataStr);
write(dataOffset, dataSection);
write(gotPltOffset, gotPlt);
write(dynamicOffset, dynamicSection);
write(dynsymOffset, dynsymSection);
write(dynstrOffset, dynstr);
write(relaPltOffset, relaPltEntry);
write(symtabOffset, symtabSection);
write(strtabOffset, strtab);
write(shstrtabOffset, shstrtab);

for (let i = 0; i < sectionHeaders.length; i++) {
  write(shdrTableOffset + i * SHDR_SIZE, sectionHeaders[i]);
}

const outDir = path.join(__dirname, "..", "public", "samples");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "hello-dynamic.bin"), binary);

console.log(`Generated hello-dynamic.bin (${binary.length} bytes)`);
console.log(`  ELF Header: 0-${EHDR_SIZE}`);
console.log(`  PHDR Table: ${phdrTableOffset}-${phdrTableOffset + phdrTableSize}`);
console.log(`  .interp: ${interpOffset}`);
console.log(`  .text: ${textOffset}`);
console.log(`  .plt: ${pltOffset}`);
console.log(`  .rodata: ${rodataOffset}`);
console.log(`  .data: ${dataOffset}`);
console.log(`  .got.plt: ${gotPltOffset}`);
console.log(`  .dynamic: ${dynamicOffset}`);
console.log(`  .dynsym: ${dynsymOffset}`);
console.log(`  .dynstr: ${dynstrOffset}`);
console.log(`  .rela.plt: ${relaPltOffset}`);
console.log(`  .symtab: ${symtabOffset}`);
console.log(`  .strtab: ${strtabOffset}`);
console.log(`  .shstrtab: ${shstrtabOffset}`);
console.log(`  SHDR Table: ${shdrTableOffset}`);

const objHeader = [
  0x7f, 0x45, 0x4c, 0x46,
  0x02, 0x01, 0x01, 0x00,
  0x00, ...new Array(7).fill(0),
  ...u16le(0x01),
  ...u16le(0x3e),
  ...u32le(1),
  ...u64le(0),
  ...u64le(0),
  ...u64le(0),
  ...u32le(0),
  ...u16le(EHDR_SIZE),
  ...u16le(0),
  ...u16le(0),
  ...u16le(SHDR_SIZE),
  ...u16le(6),
  ...u16le(5),
];

const objTextCode = textCode.slice(0, 27);
const objRodataStr = strBytes("Hello, ELF Explorer!");
const objStrtab = [0, ...strBytes("hello.c"), ...strBytes("main"), ...strBytes("greeting")];
const objShstrtab = [0, ...strBytes(".text"), ...strBytes(".rodata"), ...strBytes(".symtab"), ...strBytes(".strtab"), ...strBytes(".shstrtab")];

function findInObjShstrtab(name: string): number {
  const bytes = Buffer.from(objShstrtab);
  const target = Buffer.from(name + "\0");
  return bytes.indexOf(target);
}

function findInObjStrtab(name: string): number {
  const bytes = Buffer.from(objStrtab);
  const target = Buffer.from(name + "\0");
  return bytes.indexOf(target);
}

let objOff = EHDR_SIZE;
const objTextOff = objOff; objOff += objTextCode.length; objOff = Math.ceil(objOff / 16) * 16;
const objRodataOff = objOff; objOff += objRodataStr.length; objOff = Math.ceil(objOff / 16) * 16;
const objSymtab = [
  ...symEntry(0, 0, 0, 0, 0, 0),
  ...symEntry(findInObjStrtab("hello.c"), 0x04, 0, 0xfff1, 0, 0),
  ...symEntry(findInObjStrtab("main"), 0x12, 0, 1, 0, objTextCode.length),
  ...symEntry(findInObjStrtab("greeting"), 0x11, 0, 2, 0, 8),
];
const objSymtabOff = objOff; objOff += objSymtab.length; objOff = Math.ceil(objOff / 16) * 16;
const objStrtabOff = objOff; objOff += objStrtab.length; objOff = Math.ceil(objOff / 16) * 16;
const objShstrtabOff = objOff; objOff += objShstrtab.length; objOff = Math.ceil(objOff / 16) * 16;
const objShdrOff = objOff;

const objShdrs = [
  makeShdr(0, SHT_NULL, 0, 0, 0, 0, 0, 0, 0, 0),
  makeShdr(findInObjShstrtab(".text"), SHT_PROGBITS, SHF_ALLOC | SHF_EXECINSTR, 0, objTextOff, objTextCode.length, 0, 0, 16, 0),
  makeShdr(findInObjShstrtab(".rodata"), SHT_PROGBITS, SHF_ALLOC, 0, objRodataOff, objRodataStr.length, 0, 0, 4, 0),
  makeShdr(findInObjShstrtab(".symtab"), SHT_SYMTAB, 0, 0, objSymtabOff, objSymtab.length, 4, 2, 8, 24),
  makeShdr(findInObjShstrtab(".strtab"), SHT_STRTAB, 0, 0, objStrtabOff, objStrtab.length, 0, 0, 1, 0),
  makeShdr(findInObjShstrtab(".shstrtab"), SHT_STRTAB, 0, 0, objShstrtabOff, objShstrtab.length, 0, 0, 1, 0),
];

objHeader.splice(40, 8, ...u64le(objShdrOff));
objHeader.splice(62, 2, ...u16le(5));

const objTotal = objShdrOff + 6 * SHDR_SIZE;
const objBinary = new Uint8Array(objTotal);

function objWrite(off: number, data: number[]) {
  for (let i = 0; i < data.length; i++) {
    if (off + i < objBinary.length) objBinary[off + i] = data[i];
  }
}

objWrite(0, objHeader);
objWrite(objTextOff, objTextCode);
objWrite(objRodataOff, objRodataStr);
objWrite(objSymtabOff, objSymtab);
objWrite(objStrtabOff, objStrtab);
objWrite(objShstrtabOff, objShstrtab);
for (let i = 0; i < objShdrs.length; i++) {
  objWrite(objShdrOff + i * SHDR_SIZE, objShdrs[i]);
}

fs.writeFileSync(path.join(outDir, "hello.o"), objBinary);
console.log(`\nGenerated hello.o (${objBinary.length} bytes)`);

const strippedBinary = new Uint8Array(binary);
const strippedShdr = new Uint8Array(SHDR_SIZE * NUM_SECTIONS);
for (let i = 0; i < sectionHeaders.length; i++) {
  const src = sectionHeaders[i];
  for (let j = 0; j < src.length; j++) {
    strippedShdr[i * SHDR_SIZE + j] = src[j];
  }
}
for (let b = 0; b < symtabSection.length; b++) {
  strippedBinary[symtabOffset + b] = 0;
}
for (let b = 0; b < strtab.length; b++) {
  strippedBinary[strtabOffset + b] = 0;
}
const zeroShdr = makeShdr(0, SHT_NULL, 0, 0, 0, 0, 0, 0, 0, 0);
for (let j = 0; j < SHDR_SIZE; j++) {
  strippedBinary[shdrTableOffset + 11 * SHDR_SIZE + j] = zeroShdr[j] || 0;
  strippedBinary[shdrTableOffset + 12 * SHDR_SIZE + j] = zeroShdr[j] || 0;
}

fs.writeFileSync(path.join(outDir, "hello-stripped.bin"), strippedBinary);
console.log(`Generated hello-stripped.bin (${strippedBinary.length} bytes)`);

const staticHeader = [
  0x7f, 0x45, 0x4c, 0x46,
  0x02, 0x01, 0x01, 0x00,
  0x00, ...new Array(7).fill(0),
  ...u16le(0x02),
  ...u16le(0x3e),
  ...u32le(1),
  ...u64le(0x400000 + textOffset),
  ...u64le(phdrTableOffset),
  ...u64le(0),
  ...u32le(0),
  ...u16le(EHDR_SIZE),
  ...u16le(PHDR_SIZE),
  ...u16le(2),
  ...u16le(SHDR_SIZE),
  ...u16le(5),
  ...u16le(4),
];

const staticPhdrs = [
  makePhdr(PT_LOAD, PF_R | PF_X, 0, 0x400000, pltOffset, pltOffset, 0x1000),
  makePhdr(PT_LOAD, PF_R | PF_W, dataOffset, 0x400000 + dataOffset, dataSection.length, dataSection.length + BSS_SIZE, 0x1000),
];

const staticShstrtab = [0, ...strBytes(".text"), ...strBytes(".rodata"), ...strBytes(".data"), ...strBytes(".shstrtab")];
function findInStaticShstrtab(name: string): number {
  const bytes = Buffer.from(staticShstrtab);
  return bytes.indexOf(Buffer.from(name + "\0"));
}

const staticShstrtabOff = rodataOffset + rodataStr.length;
const staticShdrOff = Math.ceil((staticShstrtabOff + staticShstrtab.length) / 16) * 16;
const staticTotal = staticShdrOff + 5 * SHDR_SIZE;

staticHeader.splice(40, 8, ...u64le(staticShdrOff));

const staticShdrs = [
  makeShdr(0, SHT_NULL, 0, 0, 0, 0, 0, 0, 0, 0),
  makeShdr(findInStaticShstrtab(".text"), SHT_PROGBITS, SHF_ALLOC | SHF_EXECINSTR, 0x400000 + textOffset, textOffset, textCode.length, 0, 0, 16, 0),
  makeShdr(findInStaticShstrtab(".rodata"), SHT_PROGBITS, SHF_ALLOC, 0x400000 + rodataOffset, rodataOffset, rodataStr.length, 0, 0, 4, 0),
  makeShdr(findInStaticShstrtab(".data"), SHT_PROGBITS, SHF_WRITE | SHF_ALLOC, 0x400000 + dataOffset, dataOffset, dataSection.length, 0, 0, 8, 0),
  makeShdr(findInStaticShstrtab(".shstrtab"), SHT_STRTAB, 0, 0, staticShstrtabOff, staticShstrtab.length, 0, 0, 1, 0),
];

const staticBinary = new Uint8Array(staticTotal);
function staticWrite(off: number, data: number[]) {
  for (let i = 0; i < data.length; i++) {
    if (off + i < staticBinary.length) staticBinary[off + i] = data[i];
  }
}

staticWrite(0, staticHeader);
for (let i = 0; i < staticPhdrs.length; i++) {
  staticWrite(phdrTableOffset + i * PHDR_SIZE, staticPhdrs[i]);
}
staticWrite(textOffset, textCode);
staticWrite(rodataOffset, rodataStr);
staticWrite(dataOffset, dataSection);
staticWrite(staticShstrtabOff, staticShstrtab);
for (let i = 0; i < staticShdrs.length; i++) {
  staticWrite(staticShdrOff + i * SHDR_SIZE, staticShdrs[i]);
}

fs.writeFileSync(path.join(outDir, "hello-static.bin"), staticBinary);
console.log(`Generated hello-static.bin (${staticBinary.length} bytes)`);

const soHeader = [
  0x7f, 0x45, 0x4c, 0x46,
  0x02, 0x01, 0x01, 0x00,
  0x00, ...new Array(7).fill(0),
  ...u16le(0x03),
  ...u16le(0x3e),
  ...u32le(1),
  ...u64le(textOffset),
  ...u64le(phdrTableOffset),
  ...u64le(shdrTableOffset),
  ...u32le(0),
  ...u16le(EHDR_SIZE),
  ...u16le(PHDR_SIZE),
  ...u16le(NUM_PHDRS),
  ...u16le(SHDR_SIZE),
  ...u16le(NUM_SECTIONS),
  ...u16le(14),
];

const soBinary = new Uint8Array(binary);
for (let i = 0; i < soHeader.length && i < 64; i++) {
  soBinary[i] = soHeader[i];
}

fs.writeFileSync(path.join(outDir, "libhello.so"), soBinary);
console.log(`Generated libhello.so (${soBinary.length} bytes)`);

console.log("\nAll sample binaries generated!");
