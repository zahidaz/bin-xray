"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Category =
  | "all"
  | "elf-structure"
  | "sections"
  | "segments"
  | "symbols"
  | "linking"
  | "memory"
  | "toolchain"
  | "cpu";

interface Term {
  term: string;
  aka?: string[];
  short: string;
  long: string;
  category: Exclude<Category, "all">;
  seeAlso?: string[];
  module?: string;
  cType?: string;
}

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: "all", label: "All", color: "bg-zinc-600" },
  { id: "elf-structure", label: "ELF Structure", color: "bg-purple-500" },
  { id: "sections", label: "Sections", color: "bg-red-500" },
  { id: "segments", label: "Segments", color: "bg-blue-500" },
  { id: "symbols", label: "Symbols", color: "bg-green-500" },
  { id: "linking", label: "Linking", color: "bg-pink-500" },
  { id: "memory", label: "Memory", color: "bg-orange-500" },
  { id: "toolchain", label: "Toolchain", color: "bg-cyan-500" },
  { id: "cpu", label: "CPU / OS", color: "bg-yellow-500" },
];

const TERMS: Term[] = [
  {
    term: "ELF",
    aka: ["Executable and Linkable Format"],
    short: "The standard binary format for executables, object files, shared libraries, and core dumps on Linux/Unix.",
    long: "ELF replaced older formats like a.out and COFF. It's used across Linux, FreeBSD, Solaris, and many embedded systems. The format is designed to be extensible — the same container works for relocatable objects (.o), executables, shared libraries (.so), and core dumps. The kernel only needs program headers to load it; section headers are optional at runtime.",
    category: "elf-structure",
    module: "/modules/02-elf-header",
  },
  {
    term: "ELF Header",
    aka: ["Elf64_Ehdr", "File Header"],
    short: "The first 64 bytes of every ELF file. Contains the magic number, type, architecture, and pointers to the two tables.",
    long: "Always starts at offset 0. The first 16 bytes are the e_ident array (magic, class, endianness, OS ABI). The remaining fields describe the file type (ET_REL, ET_EXEC, ET_DYN), target machine (EM_X86_64, EM_AARCH64), entry point address, and the offsets/sizes of the program header table and section header table. This is the only structure at a fixed location — everything else is found by following pointers from here.",
    category: "elf-structure",
    cType: "Elf64_Ehdr",
    seeAlso: ["Magic Number", "e_entry", "Program Header Table", "Section Header Table"],
    module: "/modules/02-elf-header",
  },
  {
    term: "Magic Number",
    aka: ["ELF Magic", "e_ident[EI_MAG]"],
    short: "The bytes 0x7f 'E' 'L' 'F' at offset 0 that identify a file as ELF.",
    long: "The kernel checks these four bytes before doing anything else. If they don't match, execve() returns ENOEXEC. Many file formats use magic numbers — PNG starts with 0x89504E47, ZIP with 0x504B. The 0x7f prefix was chosen because it's the ASCII DEL character, making ELF files non-printable and preventing them from being accidentally interpreted as text.",
    category: "elf-structure",
    seeAlso: ["ELF Header"],
    module: "/modules/02-elf-header",
  },
  {
    term: "e_entry",
    aka: ["Entry Point"],
    short: "The virtual address where the CPU starts executing after the binary is loaded.",
    long: "For dynamically linked executables, this typically points to _start (from crt1.o), not main(). The _start function sets up argc/argv, calls __libc_start_main, which eventually calls your main(). For statically linked binaries or the dynamic linker itself, the entry point is the true starting instruction. In position-independent executables (PIE), this is a relative offset that gets relocated.",
    category: "elf-structure",
    cType: "Elf64_Addr",
    seeAlso: ["ELF Header", "_start", "PIE"],
    module: "/modules/02-elf-header",
  },
  {
    term: "Program Header Table",
    aka: ["PHT", "Segment Table"],
    short: "An array of Elf64_Phdr structures that tells the kernel how to map the file into memory.",
    long: "Located at offset e_phoff in the file. Each entry describes one segment — its type (PT_LOAD, PT_INTERP, PT_DYNAMIC), file offset, virtual address, size on disk, size in memory, and permission flags. The kernel iterates this table during execve() to create the process's address space. Object files (.o) don't have a program header table — they haven't been linked yet.",
    category: "segments",
    cType: "Elf64_Phdr[]",
    seeAlso: ["Segment", "PT_LOAD", "Section Header Table"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "Section Header Table",
    aka: ["SHT"],
    short: "An array of Elf64_Shdr structures that describes named sections — the linker's view of the binary.",
    long: "Located at offset e_shoff. Each entry describes a section: name (index into .shstrtab), type, flags, address, offset, size, and links to related sections. Used by linkers, debuggers, and tools like readelf and objdump. The kernel ignores it entirely — you can strip it and the binary still runs. Object files rely heavily on sections for symbol resolution and relocation.",
    category: "sections",
    cType: "Elf64_Shdr[]",
    seeAlso: ["Section", "Program Header Table", ".shstrtab"],
    module: "/modules/03-sections-vs-segments",
  },
  {
    term: "Segment",
    aka: ["Program Header Entry"],
    short: "A contiguous chunk of the file to be mapped into memory at load time. The loader's view.",
    long: "Segments are what the kernel cares about. A single LOAD segment often contains multiple sections (.text + .rodata might share a read-execute segment). Segments have permissions (R/W/X) that become page table entries. Non-LOAD segments like PT_INTERP and PT_DYNAMIC carry metadata but aren't directly mapped as data regions.",
    category: "segments",
    seeAlso: ["Section", "PT_LOAD", "Program Header Table"],
    module: "/modules/03-sections-vs-segments",
  },
  {
    term: "Section",
    short: "A named region of the file with a specific purpose. The linker's view.",
    long: "Sections are fine-grained: .text for code, .data for initialized globals, .rodata for constants, .symtab for symbols. The linker reads sections from multiple object files, merges same-named sections, resolves symbols, and writes the result. At runtime, sections don't exist — only segments matter. That's why you can strip section headers and the binary still works.",
    category: "sections",
    seeAlso: ["Segment", ".text", ".data", ".bss"],
    module: "/modules/03-sections-vs-segments",
  },
  {
    term: "PT_LOAD",
    short: "Segment type that gets mapped into memory. The workhorse of ELF loading.",
    long: "Most executables have 2-3 PT_LOAD segments: one for read-execute (code), one for read-write (data), and sometimes one for read-only data. The kernel calls mmap() for each one. p_filesz bytes are copied from disk; if p_memsz > p_filesz, the extra bytes are zero-filled (this is how .bss works). The permissions become page protections: PROT_READ, PROT_WRITE, PROT_EXEC.",
    category: "segments",
    seeAlso: ["Segment", ".bss", "mmap"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "PT_INTERP",
    short: "Segment containing the path to the dynamic linker (e.g., /lib64/ld-linux-x86-64.so.2).",
    long: "When the kernel sees PT_INTERP, it doesn't jump to e_entry directly. Instead, it loads the dynamic linker specified by this path, maps it into memory, and jumps to the dynamic linker's entry point. The dynamic linker then resolves shared libraries, processes relocations, and eventually transfers control to the application. Static binaries don't have PT_INTERP.",
    category: "segments",
    seeAlso: ["Dynamic Linker", "PT_DYNAMIC"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "PT_DYNAMIC",
    short: "Segment pointing to the .dynamic section — the dynamic linker's instruction manual.",
    long: "Contains a pointer to the .dynamic section, which is an array of tag-value pairs (Elf64_Dyn). Tags include DT_NEEDED (library dependencies), DT_STRTAB, DT_SYMTAB, DT_PLTGOT, DT_JMPREL, and more. The dynamic linker reads this to find everything it needs: which libraries to load, where the symbol tables are, and where to write resolved addresses.",
    category: "segments",
    seeAlso: [".dynamic", "Dynamic Linker", "DT_NEEDED"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: ".text",
    short: "Section containing executable machine code.",
    long: "This is where your compiled functions live as raw machine instructions. Mapped into a read-execute segment — writable permissions are not set, so code can't self-modify (W^X policy). The disassembler reads this section. In position-independent code, .text uses RIP-relative addressing to access data without hardcoded addresses.",
    category: "sections",
    seeAlso: [".rodata", ".plt", "W^X"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".data",
    short: "Section for initialized global and static variables.",
    long: "Contains variables with non-zero initial values, like `int count = 42;` or `const char *msg = \"hello\";` (the pointer itself, not the string). Mapped read-write. Takes space on disk proportional to the data size. Contrast with .bss, which stores zero-initialized data and takes no disk space.",
    category: "sections",
    seeAlso: [".bss", ".rodata"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".bss",
    aka: ["Block Started by Symbol"],
    short: "Section for zero-initialized or uninitialized global/static variables. Takes no space on disk.",
    long: "The name comes from an old IBM assembler directive. .bss has type SHT_NOBITS — the section header records a size, but there are zero bytes on disk. The kernel zero-fills the memory when mapping the segment (p_memsz > p_filesz accounts for .bss). This is why `char buffer[1048576];` doesn't make your binary 1MB larger. All bytes are guaranteed zero at program start.",
    category: "sections",
    seeAlso: [".data", "PT_LOAD", "SHT_NOBITS"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".rodata",
    short: "Section for read-only data: string literals, constants, jump tables.",
    long: "When you write `printf(\"Hello\")`, the string \"Hello\" lives in .rodata. Mapped into a read-only segment — writing to it causes a segfault. The compiler puts anything it can prove is immutable here. Sharing .rodata across processes is safe since it can't change, so the kernel can map the same physical pages to multiple processes.",
    category: "sections",
    seeAlso: [".data", ".text"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".symtab",
    short: "Symbol table containing all symbols — functions, globals, locals, file names.",
    long: "An array of Elf64_Sym entries. Each has a name (index into .strtab), type (FUNC, OBJECT, FILE), binding (LOCAL, GLOBAL, WEAK), a section index, value (address or offset), and size. Used by debuggers (gdb), profilers (perf), and stack unwinders. Can be stripped without affecting execution — only the dynamic symbol table (.dynsym) is needed at runtime.",
    category: "symbols",
    cType: "Elf64_Sym[]",
    seeAlso: [".strtab", ".dynsym", "strip"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".strtab",
    aka: ["String Table"],
    short: "Null-terminated strings referenced by .symtab entries.",
    long: "A flat blob of null-terminated strings packed end to end. Symbol names, file names, and other identifiers are stored here. The st_name field in Elf64_Sym is a byte offset into this table. Having a separate string table avoids duplicating strings and allows sharing between symbol entries. Stripped along with .symtab.",
    category: "symbols",
    seeAlso: [".symtab", ".dynstr", ".shstrtab"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".shstrtab",
    aka: ["Section Header String Table"],
    short: "String table containing section names. Indexed by e_shstrndx in the ELF header.",
    long: "Every section's sh_name is an offset into this table. Without it, tools like readelf can't display section names — they'd just show numeric indices. This is a separate table from .strtab because section names and symbol names serve different purposes and may be stripped independently.",
    category: "sections",
    seeAlso: [".strtab", "Section Header Table"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: ".dynsym",
    aka: ["Dynamic Symbol Table"],
    short: "Symbol table for dynamic linking — only symbols visible across shared library boundaries.",
    long: "A subset of .symtab containing only globally visible symbols needed at runtime: exported functions, imported functions from shared libraries, and global data. Unlike .symtab, this section is loaded into memory (SHF_ALLOC) and cannot be stripped — the dynamic linker needs it to resolve symbols. Uses .dynstr for names instead of .strtab.",
    category: "symbols",
    cType: "Elf64_Sym[]",
    seeAlso: [".dynstr", ".symtab", "PLT", "GOT"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: ".dynstr",
    aka: ["Dynamic String Table"],
    short: "String table for dynamic symbol names and library names.",
    long: "Like .strtab but for runtime. Contains the names referenced by .dynsym entries and DT_NEEDED tags (shared library names like \"libc.so.6\"). Loaded into memory because the dynamic linker needs to read it. Cannot be stripped.",
    category: "symbols",
    seeAlso: [".dynsym", ".strtab", "DT_NEEDED"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: ".dynamic",
    short: "Array of Elf64_Dyn tag-value pairs — the dynamic linker's roadmap.",
    long: "Each entry is a 16-byte struct with d_tag and d_val. Tags tell the dynamic linker where to find symbol tables (DT_SYMTAB, DT_STRTAB), relocations (DT_JMPREL, DT_RELA), needed libraries (DT_NEEDED), the PLT/GOT (DT_PLTGOT), and more. It's essentially a key-value store of everything needed for dynamic linking. Terminated by a DT_NULL entry.",
    category: "linking",
    cType: "Elf64_Dyn[]",
    seeAlso: ["PT_DYNAMIC", "DT_NEEDED", "Dynamic Linker"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "PLT",
    aka: ["Procedure Linkage Table", ".plt"],
    short: "Trampoline stubs for calling functions in shared libraries. Enables lazy binding.",
    long: "Each external function gets a small PLT entry (typically 16 bytes). On the first call, the PLT stub reads the GOT (which initially points back to the PLT), pushes a relocation index, and jumps to the resolver. After resolution, the GOT is patched with the real address. Subsequent calls go through the PLT but immediately bounce to the real function via the now-resolved GOT entry. This indirection allows shared libraries to be loaded at arbitrary addresses.",
    category: "linking",
    seeAlso: ["GOT", "Lazy Binding", "Dynamic Linker", ".rela.plt"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "GOT",
    aka: ["Global Offset Table", ".got", ".got.plt"],
    short: "Table of addresses filled in at runtime by the dynamic linker. PLT stubs read from here.",
    long: "The GOT is a writable data section containing pointers. For lazy binding, GOT entries initially point back to the corresponding PLT stub's second instruction. When the dynamic linker resolves a symbol, it writes the real address into the GOT. There are two GOT sections: .got for data relocations (resolved at load time) and .got.plt for function relocations (resolved lazily). The GOT is what makes position-independent code possible.",
    category: "linking",
    seeAlso: ["PLT", "Lazy Binding", ".rela.plt", "PIC"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "Lazy Binding",
    aka: ["Lazy Resolution", "On-Demand Binding"],
    short: "Deferring symbol resolution until a function is actually called, rather than resolving everything at startup.",
    long: "Without lazy binding, the dynamic linker would resolve every imported function at load time, even those never called — slowing startup. With lazy binding (the default), the PLT/GOT mechanism delays resolution until the first call. The environment variable LD_BIND_NOW=1 or the DF_BIND_NOW flag disables lazy binding, forcing immediate resolution (useful for security via RELRO).",
    category: "linking",
    seeAlso: ["PLT", "GOT", "RELRO", "Dynamic Linker"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: ".rela.plt",
    short: "Relocation entries for PLT/GOT function slots. Tells the dynamic linker what to patch.",
    long: "Each Elf64_Rela entry specifies: r_offset (the GOT slot address to patch), r_info (which symbol to resolve and relocation type — typically R_X86_64_JUMP_SLOT), and r_addend. When the dynamic linker resolves a PLT call, it looks up the entry here to know which GOT slot to write and which symbol name to search for.",
    category: "linking",
    cType: "Elf64_Rela[]",
    seeAlso: [".rela.dyn", "PLT", "GOT", "R_X86_64_JUMP_SLOT"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: ".rela.dyn",
    short: "Relocation entries for data references resolved at load time (not lazily).",
    long: "Handles relocations like R_X86_64_GLOB_DAT (patching GOT entries for global data) and R_X86_64_RELATIVE (adjusting addresses in PIE binaries). Unlike .rela.plt, these are processed eagerly at load time by the dynamic linker. The number of .rela.dyn entries affects startup time directly.",
    category: "linking",
    cType: "Elf64_Rela[]",
    seeAlso: [".rela.plt", "R_X86_64_GLOB_DAT", "PIE"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "Dynamic Linker",
    aka: ["ld-linux.so", "ld.so", "RTLD", "Runtime Linker"],
    short: "The program that loads shared libraries and resolves symbols at runtime. Specified by PT_INTERP.",
    long: "On Linux, typically /lib64/ld-linux-x86-64.so.2. The kernel maps it alongside your executable and jumps to its entry point first. It reads the .dynamic section, loads DT_NEEDED libraries (recursively), processes relocations, initializes the PLT/GOT, and finally transfers control to your program's e_entry. It also handles dlopen()/dlsym() for runtime loading.",
    category: "linking",
    seeAlso: ["PT_INTERP", ".dynamic", "PLT", "GOT", "Shared Library"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "Relocation",
    short: "An instruction to the linker/loader: 'patch this address once you know the final value.'",
    long: "When the compiler generates an object file, it doesn't know final addresses. Instead, it emits relocation entries that say 'at offset X, write the address of symbol Y plus addend Z.' The static linker processes relocations from .rela.text when combining .o files. The dynamic linker processes .rela.plt and .rela.dyn at runtime. Each relocation type (R_X86_64_PC32, R_X86_64_PLT32, etc.) uses a different formula.",
    category: "linking",
    cType: "Elf64_Rela",
    seeAlso: [".rela.plt", ".rela.dyn", "Linker"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "Symbol",
    short: "A named entity in the binary — a function, variable, section, or file reference.",
    long: "Represented by Elf64_Sym. Key fields: st_name (name), st_info (binding + type), st_shndx (which section it's in), st_value (address/offset), st_size. Binding determines visibility: LOCAL (file-scoped), GLOBAL (visible to linker), WEAK (can be overridden). Type indicates: FUNC, OBJECT (data), SECTION, FILE. Undefined symbols (st_shndx = SHN_UNDEF) must be resolved by the linker.",
    category: "symbols",
    cType: "Elf64_Sym",
    seeAlso: [".symtab", ".dynsym", "Relocation"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: "DT_NEEDED",
    short: "Dynamic tag listing a required shared library (e.g., libc.so.6).",
    long: "Each DT_NEEDED entry's d_val is an offset into .dynstr giving the library's SONAME. The dynamic linker uses the search path (DT_RPATH, DT_RUNPATH, LD_LIBRARY_PATH, /etc/ld.so.cache, default paths) to find and load each needed library. Libraries can themselves have DT_NEEDED entries, creating a dependency tree.",
    category: "linking",
    seeAlso: [".dynamic", "Shared Library", "SONAME"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "Shared Library",
    aka: ["Shared Object", ".so", "DSO"],
    short: "A library loaded at runtime and shared across processes. File type ET_DYN.",
    long: "Shared libraries are ELF files of type ET_DYN. They're compiled with -fPIC (position-independent code) so they can be loaded at any address. The dynamic linker maps them into the process's address space. Multiple processes can share the same physical memory pages for a .so's read-only segments (code, rodata), saving RAM. They export symbols through .dynsym and import them from other libraries.",
    category: "linking",
    seeAlso: ["PIC", "ET_DYN", "Dynamic Linker", "SONAME"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "PIC",
    aka: ["Position-Independent Code"],
    short: "Code that works regardless of where it's loaded in memory. Required for shared libraries.",
    long: "PIC avoids hardcoded absolute addresses. Instead, it uses the GOT for global data access and PC-relative addressing for local references. On x86-64, the instruction `lea rax, [rip+offset]` computes an address relative to the current instruction pointer. The small performance cost (extra GOT indirection) is offset by enabling code sharing and ASLR. Compiled with gcc -fPIC.",
    category: "memory",
    seeAlso: ["PIE", "GOT", "ASLR"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "PIE",
    aka: ["Position-Independent Executable"],
    short: "An executable compiled as a shared object (ET_DYN) so the kernel can load it at a random address.",
    long: "PIE combines PIC techniques with an executable. The file type is ET_DYN (not ET_EXEC), and the kernel randomizes its base address via ASLR. Modern Linux distributions compile all executables as PIE by default. The tradeoff is slightly more complex addressing, but the security benefits of ASLR are significant. A PIE binary can be distinguished from a shared library by having a regular entry point and PT_INTERP.",
    category: "memory",
    seeAlso: ["PIC", "ASLR", "ET_DYN"],
  },
  {
    term: "ASLR",
    aka: ["Address Space Layout Randomization"],
    short: "Kernel feature that randomizes where code, data, stack, and heap are placed in virtual memory.",
    long: "Each time a process starts, the kernel chooses random base addresses for the executable (if PIE), shared libraries, stack, heap, and mmap regions. This makes exploitation harder because an attacker can't predict addresses. ASLR is most effective with PIE — non-PIE executables are loaded at their fixed addresses (typically 0x400000). Check with `cat /proc/sys/kernel/randomize_va_space`.",
    category: "memory",
    seeAlso: ["PIE", "Virtual Address"],
  },
  {
    term: "Virtual Address",
    aka: ["VA", "VMA"],
    short: "An address in a process's virtual address space, as opposed to a physical RAM address.",
    long: "Every process gets its own 48-bit (256 TB) virtual address space on x86-64. The MMU and page tables translate virtual addresses to physical addresses. Two processes can have the same virtual address 0x7ffff7e00000 mapped to different physical pages. ELF segments specify virtual addresses (p_vaddr) where they should be mapped. The kernel, through mmap, creates the necessary page table entries.",
    category: "memory",
    seeAlso: ["Page", "mmap", "PT_LOAD"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "Page",
    aka: ["Memory Page"],
    short: "The smallest unit of virtual memory, typically 4096 bytes (4 KB) on x86-64.",
    long: "The CPU's MMU translates addresses one page at a time. Each page has independent permissions (read, write, execute) set in the page table. Segment mappings are page-aligned — if .text starts at offset 0x1000, it maps neatly to a page boundary. This is why ELF segments often have p_align = 0x1000. Huge pages (2 MB or 1 GB) exist for performance-sensitive applications.",
    category: "memory",
    seeAlso: ["Virtual Address", "W^X", "mmap"],
  },
  {
    term: "mmap",
    short: "System call that maps files or anonymous memory into a process's virtual address space.",
    long: "The kernel uses mmap internally to load ELF segments. For a PT_LOAD segment with flags PF_R|PF_X, the kernel effectively calls mmap(p_vaddr, p_memsz, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED, fd, p_offset). MAP_PRIVATE means writes create copy-on-write pages. Anonymous mappings (no file) are used for .bss and the heap.",
    category: "memory",
    seeAlso: ["PT_LOAD", "Page", "Virtual Address"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "W^X",
    aka: ["Write XOR Execute", "DEP", "NX"],
    short: "Security policy: a memory page can be writable or executable, but never both simultaneously.",
    long: "Prevents attackers from writing shellcode into a buffer and executing it. Enforced by the CPU's NX (No eXecute) bit in page table entries, exposed through mmap's PROT_EXEC flag. ELF segments respect this: .text is R-X (read-execute), .data is RW- (read-write). JIT compilers must first mmap as RW-, write code, then mprotect to R-X.",
    category: "memory",
    seeAlso: ["Page", "ASLR"],
  },
  {
    term: "RELRO",
    aka: ["Relocation Read-Only"],
    short: "Security hardening that makes the GOT read-only after relocations are resolved.",
    long: "Partial RELRO (gcc default) makes .got read-only but leaves .got.plt writable for lazy binding. Full RELRO (-z relro -z now) resolves all symbols at load time and makes the entire GOT read-only, preventing GOT overwrite attacks. The trade-off is slower startup since all symbols must be resolved immediately. Modern distributions use Full RELRO.",
    category: "linking",
    seeAlso: ["GOT", "Lazy Binding", "W^X"],
  },
  {
    term: "SONAME",
    aka: ["Shared Object Name"],
    short: "The canonical name of a shared library, embedded in its .dynamic section as DT_SONAME.",
    long: "A library file might be libfoo.so.1.2.3, but its SONAME is libfoo.so.1. When you link against it, the linker records the SONAME (not the filename) as a DT_NEEDED entry. This lets the system admin update libfoo.so.1.2.3 to libfoo.so.1.3.0 without relinking — as long as the SONAME (ABI version) stays the same. The symlink libfoo.so.1 → libfoo.so.1.3.0 ensures the loader finds it.",
    category: "linking",
    seeAlso: ["DT_NEEDED", "Shared Library"],
  },
  {
    term: "Linker",
    aka: ["Static Linker", "ld", "Link Editor"],
    short: "Tool that combines object files (.o) and libraries into an executable or shared library.",
    long: "The linker (ld, often invoked via gcc) reads relocatable objects, resolves symbol references, merges sections, applies relocations, generates PLT/GOT entries, writes program headers, and produces the final ELF output. Key tasks: dead code elimination, section merging (multiple .text → one .text), GOT/PLT generation, and laying out the file so segments are page-aligned.",
    category: "toolchain",
    seeAlso: ["Relocation", "PLT", "GOT", "Object File"],
    module: "/modules/01-compilation-pipeline",
  },
  {
    term: "Object File",
    aka: [".o file", "Relocatable Object"],
    short: "The output of the assembler — an ELF file of type ET_REL, before linking.",
    long: "Contains compiled code and data with unresolved symbol references. Has sections (.text, .data, .rodata, .symtab) but no program headers — it can't be loaded yet. Relocation sections (.rela.text) tell the linker which addresses to fix up. The linker reads multiple .o files, resolves cross-references, and produces an executable or shared library.",
    category: "toolchain",
    cType: "ET_REL",
    seeAlso: ["Linker", "Relocation", "Section"],
    module: "/modules/01-compilation-pipeline",
  },
  {
    term: "Assembler",
    aka: ["as", "gas"],
    short: "Translates assembly language (.s) into machine code, producing an object file (.o).",
    long: "The assembler converts human-readable mnemonics (mov, push, call) into binary instruction encodings. It generates an ELF object file with .text containing machine code, .data/.rodata for data, and .rela sections for addresses it can't resolve (external function calls, global variable accesses). On Linux, the GNU assembler (gas/as) uses AT&T syntax by default.",
    category: "toolchain",
    seeAlso: ["Object File", "Compiler"],
    module: "/modules/01-compilation-pipeline",
  },
  {
    term: "Compiler",
    aka: ["cc", "gcc", "clang"],
    short: "Translates source code (C, C++, Rust) into assembly language or directly into object code.",
    long: "The compiler parses source, optimizes, and emits assembly. Modern compilers like GCC and Clang integrate the assembler, so `gcc -c file.c` goes straight from C to .o. Key flags affecting ELF output: -fPIC (position-independent code), -pie (position-independent executable), -static (no dynamic linking), -O2 (optimization level), -g (debug info), -shared (produce .so).",
    category: "toolchain",
    seeAlso: ["Assembler", "Linker", "PIC"],
    module: "/modules/01-compilation-pipeline",
  },
  {
    term: "Preprocessor",
    aka: ["cpp"],
    short: "The first compilation stage: expands #include, #define, #ifdef before the compiler sees the code.",
    long: "Processes directives: #include copies header file contents inline, #define performs text substitution, #ifdef enables conditional compilation. Output is a single expanded .i file with all macros resolved and headers inlined. Run `gcc -E file.c` to see preprocessor output. The preprocessor knows nothing about C syntax — it's pure text manipulation.",
    category: "toolchain",
    seeAlso: ["Compiler"],
    module: "/modules/01-compilation-pipeline",
  },
  {
    term: "readelf",
    short: "Command-line tool to display detailed information about ELF files.",
    long: "Part of GNU binutils. `readelf -h` shows the ELF header, `-l` shows program headers, `-S` shows section headers, `-s` shows symbols, `-r` shows relocations, `-d` shows dynamic entries. Unlike objdump, readelf works directly with the ELF format rather than using BFD, making it more reliable for edge cases. Essential for understanding any ELF binary.",
    category: "toolchain",
    seeAlso: ["objdump", "nm"],
  },
  {
    term: "strip",
    short: "Removes symbol tables and debug information from an ELF binary to reduce file size.",
    long: "Deletes .symtab, .strtab, .debug_* sections, and other non-essential sections. The binary still runs because the kernel only needs program headers. .dynsym and .dynstr survive because they're needed at runtime. A stripped binary is harder to debug (no function names in backtraces) but typically 50-90% smaller. Use `strip --strip-all` for maximum reduction.",
    category: "toolchain",
    seeAlso: [".symtab", ".strtab", "Section Header Table"],
  },
  {
    term: "execve",
    short: "System call that replaces the current process with a new program from an ELF binary.",
    long: "The kernel's entry point for program loading. It reads the ELF header, validates the magic number, iterates program headers to set up memory mappings via mmap, checks for PT_INTERP (dynamic linker), sets up the stack with argc/argv/envp and the auxiliary vector, then transfers control. If PT_INTERP exists, the dynamic linker runs first. The old process's memory is completely replaced.",
    category: "cpu",
    seeAlso: ["ELF Header", "Program Header Table", "PT_INTERP", "_start"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "_start",
    short: "The true entry point of a C program, before main(). Provided by crt1.o.",
    long: "When the kernel jumps to e_entry, it's usually _start, not main(). _start is a small assembly routine (from the C runtime startup object crt1.o) that extracts argc, argv, envp from the stack, calls __libc_start_main (which initializes the C library), and eventually calls main(). When main() returns, __libc_start_main calls exit() to clean up.",
    category: "cpu",
    seeAlso: ["e_entry", "crt1.o", "execve"],
  },
  {
    term: "Auxiliary Vector",
    aka: ["auxv", "AT_*"],
    short: "Kernel-provided metadata passed to the process on the stack alongside argc/argv/envp.",
    long: "An array of key-value pairs placed by the kernel above envp on the initial stack. Includes AT_PHDR (address of program headers in memory), AT_PHNUM (number of program headers), AT_ENTRY (entry point), AT_BASE (dynamic linker base address), AT_RANDOM (16 random bytes for stack canaries), and more. The dynamic linker uses these to bootstrap without reading the file again.",
    category: "cpu",
    seeAlso: ["execve", "Program Header Table", "Dynamic Linker"],
  },
  {
    term: "SHT_NOBITS",
    short: "Section type flag meaning the section occupies no space in the file. Used by .bss.",
    long: "A section with sh_type = SHT_NOBITS has a declared sh_size but zero bytes on disk. The difference between p_memsz and p_filesz in the containing PT_LOAD segment accounts for it. The kernel allocates zero-filled memory for these bytes. This is how large zero-initialized arrays don't bloat the binary.",
    category: "elf-structure",
    seeAlso: [".bss", "PT_LOAD"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: "R_X86_64_JUMP_SLOT",
    short: "Relocation type for PLT entries. Tells the dynamic linker to write a function's address into a GOT slot.",
    long: "Found in .rela.plt. The r_offset field points to a .got.plt entry. When the dynamic linker resolves the symbol (either lazily or eagerly), it writes the function's virtual address at that GOT slot. The corresponding PLT stub then jumps through the GOT to reach the real function.",
    category: "linking",
    seeAlso: ["PLT", "GOT", ".rela.plt", "R_X86_64_GLOB_DAT"],
  },
  {
    term: "R_X86_64_GLOB_DAT",
    short: "Relocation type for GOT entries pointing to global data symbols.",
    long: "Found in .rela.dyn. Similar to JUMP_SLOT but for data (global variables accessed across shared library boundaries). Always resolved at load time (not lazily). The dynamic linker writes the symbol's address into the GOT slot, and code accesses the variable through the GOT indirection.",
    category: "linking",
    seeAlso: ["R_X86_64_JUMP_SLOT", ".rela.dyn", "GOT"],
  },
  {
    term: "ET_EXEC",
    short: "ELF type for a traditional (non-PIE) executable, loaded at a fixed virtual address.",
    long: "ET_EXEC binaries have hardcoded virtual addresses (typically starting at 0x400000 on x86-64). The kernel loads them at exactly those addresses — no relocation. This means ASLR can't randomize the main executable (only libraries, stack, heap). Modern toolchains default to PIE (ET_DYN) instead. Use `gcc -no-pie` to produce ET_EXEC.",
    category: "elf-structure",
    seeAlso: ["ET_DYN", "PIE", "ASLR"],
  },
  {
    term: "ET_DYN",
    short: "ELF type for shared objects and position-independent executables.",
    long: "Both shared libraries (.so) and PIE executables have type ET_DYN. The key difference: PIE executables have PT_INTERP and a standard entry point, while shared libraries are loaded by the dynamic linker on behalf of another program. The kernel can load ET_DYN at any address, enabling full ASLR.",
    category: "elf-structure",
    seeAlso: ["ET_EXEC", "PIE", "Shared Library"],
  },
  {
    term: "ET_REL",
    short: "ELF type for relocatable object files (.o) — not yet linked.",
    long: "Object files have sections but no program headers. Virtual addresses are zero or relative. Symbols may be undefined (st_shndx = SHN_UNDEF). Relocation sections contain instructions for the linker to patch addresses. Multiple ET_REL files are combined by the linker into ET_EXEC or ET_DYN.",
    category: "elf-structure",
    seeAlso: ["Object File", "Linker", "Relocation"],
    module: "/modules/01-compilation-pipeline",
  },
  {
    term: "Endianness",
    aka: ["Byte Order"],
    short: "The order in which multi-byte values are stored. ELF specifies this in e_ident[EI_DATA].",
    long: "Little-endian (ELFDATA2LSB): least significant byte first. 0x01020304 is stored as 04 03 02 01. Used by x86, x86-64, ARM (usually). Big-endian (ELFDATA2MSB): most significant byte first. 0x01020304 stored as 01 02 03 04. Used by SPARC, some MIPS. The ELF parser must read multi-byte fields according to this flag. DataView in JavaScript supports both via the littleEndian parameter.",
    category: "elf-structure",
    seeAlso: ["ELF Header"],
    module: "/modules/02-elf-header",
  },
  {
    term: "ABI",
    aka: ["Application Binary Interface"],
    short: "The low-level contract between compiled code and the operating system / other code.",
    long: "Specifies calling conventions (which registers hold arguments), system call numbers, data type sizes and alignment, stack frame layout, and how exceptions propagate. The System V AMD64 ABI used on Linux x86-64 puts the first six integer arguments in RDI, RSI, RDX, RCX, R8, R9. ELF's e_ident[EI_OSABI] field indicates which ABI the binary targets.",
    category: "cpu",
    seeAlso: ["ELF Header", "Calling Convention"],
  },
  {
    term: "Calling Convention",
    short: "Rules for how functions pass arguments, return values, and manage the stack.",
    long: "On x86-64 System V: integer args in RDI, RSI, RDX, RCX, R8, R9; float args in XMM0-XMM7; return value in RAX; caller-saved: RAX, RCX, RDX, R8-R11; callee-saved: RBX, RBP, R12-R15. The stack must be 16-byte aligned before CALL. Understanding this helps when reading disassembly in .text.",
    category: "cpu",
    seeAlso: ["ABI", ".text"],
  },
  {
    term: "crt1.o",
    aka: ["C Runtime Startup"],
    short: "The startup object file linked into every C executable. Contains _start.",
    long: "Provided by glibc. Contains the _start entry point that the kernel jumps to. Also linked: crti.o (function prologue for .init/.fini), crtn.o (epilogue), and crtbegin.o/crtend.o (C++ global constructor/destructor support). These are automatically added by gcc when linking. Use `gcc -v` to see the full linker command with all crt objects.",
    category: "toolchain",
    seeAlso: ["_start", "e_entry", "Linker"],
  },
  {
    term: "nm",
    short: "Command-line tool that lists symbols from an ELF binary's symbol tables.",
    long: "Reads .symtab (or .dynsym with -D flag). Output format: address, type letter (T=text/code, D=data, B=bss, U=undefined, W=weak), name. `nm -C` demangles C++ names. `nm -u` shows only undefined symbols. Useful for quickly checking what functions a binary exports or imports.",
    category: "toolchain",
    seeAlso: [".symtab", ".dynsym", "readelf"],
  },
  {
    term: "objdump",
    short: "Disassembler and binary inspection tool. Shows assembly, headers, and section contents.",
    long: "`objdump -d` disassembles .text into human-readable assembly. `-x` shows all headers. `-t` shows symbols. `-R` shows dynamic relocations. Uses the BFD library for abstraction. For raw ELF inspection, readelf is often more precise. For reading assembly code in a binary, objdump is the classic tool.",
    category: "toolchain",
    seeAlso: ["readelf", ".text"],
  },
  {
    term: "ldd",
    short: "Lists the shared libraries a dynamically linked binary depends on.",
    long: "Runs the dynamic linker in trace mode to resolve all DT_NEEDED entries and print the library paths. Output shows: library SONAME → resolved path (address). Warning: on some systems, ldd actually executes the binary — use `readelf -d` or `objdump -p` for untrusted binaries instead.",
    category: "toolchain",
    seeAlso: ["DT_NEEDED", "Dynamic Linker", "Shared Library"],
  },
  {
    term: "Core Dump",
    aka: ["Core File", "ET_CORE"],
    short: "A snapshot of a process's memory at the time of a crash, stored as an ELF file of type ET_CORE.",
    long: "When a process crashes (segfault, abort), the kernel can write its entire virtual memory, register state, and signal information to an ELF core file. Program headers describe each memory region. GDB can load a core dump (`gdb binary core`) to inspect the crash state: stack traces, variable values, register contents — all frozen at the moment of the crash.",
    category: "elf-structure",
    seeAlso: ["ELF Header"],
  },
  {
    term: "ELF Class",
    aka: ["ELFCLASS32", "ELFCLASS64"],
    short: "Whether the ELF file uses 32-bit or 64-bit structures, determined by e_ident[EI_CLASS].",
    long: "ELFCLASS32 uses 4-byte addresses and smaller header structures. ELFCLASS64 uses 8-byte addresses (Elf64_Addr is uint64_t). This affects the size of every header: Elf32_Ehdr is 52 bytes, Elf64_Ehdr is 64 bytes. Modern x86-64 systems use ELFCLASS64 exclusively. The ELF parser must check this field to know how to read subsequent structures.",
    category: "elf-structure",
    seeAlso: ["ELF Header", "Endianness"],
    module: "/modules/02-elf-header",
  },
  {
    term: "GOT Overwrite",
    short: "An exploitation technique that modifies a GOT entry to redirect function calls.",
    long: "Since the GOT is writable (to allow lazy binding), a memory corruption bug can overwrite a GOT entry. If the entry for printf is changed to point to system(), the next call to printf() actually calls system(). Mitigations: Full RELRO (makes GOT read-only after relocation), ASLR (randomizes addresses), and stack canaries.",
    category: "memory",
    seeAlso: ["GOT", "RELRO", "W^X", "ASLR"],
  },
  {
    term: ".init / .fini",
    short: "Sections containing code that runs before main() and after main() returns.",
    long: ".init runs during process startup (called by _start via __libc_start_main). .fini runs during normal termination (exit() or return from main). These are legacy — modern code uses .init_array and .fini_array (arrays of function pointers) instead, which support multiple initializers. GCC's __attribute__((constructor)) and __attribute__((destructor)) use .init_array/.fini_array.",
    category: "sections",
    seeAlso: ["_start", ".init_array"],
  },
  {
    term: ".init_array / .fini_array",
    short: "Arrays of function pointers called at startup and shutdown. The modern replacement for .init/.fini.",
    long: ".init_array holds pointers to initialization functions called before main(). .fini_array holds cleanup functions called at exit. Multiple entries are supported, executed in order (.init_array) or reverse order (.fini_array). C++ global constructors and destructors use this mechanism. Section type is SHT_INIT_ARRAY / SHT_FINI_ARRAY.",
    category: "sections",
    seeAlso: [".init / .fini", "_start"],
  },
  {
    term: ".eh_frame",
    aka: ["Exception Handling Frame"],
    short: "Stack unwinding information used by C++ exceptions, debuggers, and profilers.",
    long: "Contains DWARF Call Frame Information (CFI) describing how to restore registers and unwind the stack at every instruction. Without it, backtraces would break at optimized code (where the frame pointer is omitted). GCC generates it by default. The .eh_frame_hdr section provides a binary search index into .eh_frame for fast lookup. Takes significant binary size — sometimes 10-20% of the file.",
    category: "sections",
    seeAlso: [".eh_frame_hdr"],
  },
  {
    term: ".note",
    aka: [".note.ABI-tag", ".note.gnu.build-id"],
    short: "Sections carrying metadata in a name-descriptor format. Build IDs, ABI tags, etc.",
    long: ".note.ABI-tag identifies the minimum kernel version. .note.gnu.build-id contains a unique hash of the binary (used by debuginfod to find debug info). Notes have a structured format: name length, descriptor length, type, name string, descriptor data. Multiple note sections can coexist. The PT_NOTE segment groups them for the loader.",
    category: "sections",
    seeAlso: ["PT_NOTE"],
  },
  {
    term: "GNU Hash",
    aka: [".gnu.hash"],
    short: "A hash table for fast symbol lookup in .dynsym. Faster than the classic ELF hash (.hash).",
    long: "The dynamic linker uses the hash table to resolve symbol names without scanning every entry in .dynsym. GNU hash uses a Bloom filter for quick rejection and a hash chain for matching. It's typically 50% faster than the SysV .hash table. Most Linux binaries include both .gnu.hash and .hash for compatibility, though modern dynamic linkers prefer GNU hash.",
    category: "symbols",
    seeAlso: [".dynsym", "Dynamic Linker"],
  },
  {
    term: "Weak Symbol",
    short: "A symbol that can be overridden by a strong (GLOBAL) symbol of the same name without causing a linker error.",
    long: "If both a WEAK and a GLOBAL symbol with the same name exist, the linker picks GLOBAL. If only WEAK exists, it's used. If the WEAK symbol is undefined and nothing provides it, the reference resolves to 0 (NULL) instead of erroring. Used for optional features: `__attribute__((weak)) void debug_hook();` — call sites check if debug_hook is non-null before calling.",
    category: "symbols",
    seeAlso: ["Symbol", ".symtab"],
  },
  {
    term: "Symbol Versioning",
    aka: [".gnu.version", ".gnu.version_r"],
    short: "Mechanism allowing multiple versions of the same symbol to coexist in a shared library.",
    long: "glibc uses this heavily: printf might have versions GLIBC_2.2.5 and GLIBC_2.17 with different behaviors. When linking, the linker records which version the application needs. At runtime, the dynamic linker matches the version. This is how glibc maintains backward compatibility across decades while still adding features.",
    category: "symbols",
    seeAlso: ["SONAME", ".dynsym", "Shared Library"],
  },
  {
    term: "Segment Permissions",
    aka: ["PF_R", "PF_W", "PF_X"],
    short: "Read/Write/Execute flags on program headers that become page table permissions.",
    long: "PF_R (4) = readable, PF_W (2) = writable, PF_X (1) = executable. Common combos: R-X for code (PT_LOAD with .text), RW- for data (PT_LOAD with .data/.bss), R-- for read-only data. These map to mmap's PROT_READ, PROT_WRITE, PROT_EXEC. Violating permissions causes SIGSEGV. The kernel enforces these through hardware page table entries.",
    category: "segments",
    seeAlso: ["PT_LOAD", "W^X", "Page"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "PT_GNU_STACK",
    short: "Segment that specifies stack permissions. Used to control whether the stack is executable.",
    long: "If this segment has PF_X, the stack is executable (very bad for security). Modern toolchains emit PT_GNU_STACK without PF_X, making the stack non-executable. If this segment is absent, the kernel assumes the stack should be executable for backward compatibility. Always check with `readelf -l binary | grep GNU_STACK`.",
    category: "segments",
    seeAlso: ["W^X", "Segment Permissions"],
  },
  {
    term: "PT_GNU_RELRO",
    short: "Segment marking memory that should become read-only after relocations are processed.",
    long: "Covers the .got section, .dynamic, and other sections that need to be writable during startup but should be locked down afterward. After the dynamic linker processes relocations, it calls mprotect() on this region to make it read-only. This is 'Partial RELRO.' Full RELRO additionally resolves all PLT entries eagerly and protects .got.plt too.",
    category: "segments",
    seeAlso: ["RELRO", "GOT", "Segment Permissions"],
  },
  {
    term: "DataView",
    short: "JavaScript API for reading typed values from an ArrayBuffer with explicit endianness control.",
    long: "The browser-side ELF parser uses DataView to read multi-byte fields: getUint16(offset, littleEndian), getUint32(), getBigUint64(). Unlike TypedArrays, DataView handles endianness correctly — essential since ELF files can be little or big endian. This is why the parser works: `view.getBigUint64(24, true)` reads e_entry as a little-endian 64-bit integer.",
    category: "toolchain",
    seeAlso: ["Endianness", "ELF"],
  },
  {
    term: "Elf64_Ehdr",
    short: "The C struct type for the 64-bit ELF file header. 64 bytes.",
    long: "Fields: e_ident[16] (magic, class, endian, ABI), e_type (ET_EXEC/ET_DYN/etc.), e_machine (EM_X86_64/etc.), e_version, e_entry (entry point VA), e_phoff (PHT offset), e_shoff (SHT offset), e_flags, e_ehsize (this header's size), e_phentsize/e_phnum (PHT entry size/count), e_shentsize/e_shnum (SHT entry size/count), e_shstrndx (section name string table index).",
    category: "elf-structure",
    cType: "Elf64_Ehdr",
    seeAlso: ["ELF Header", "Elf64_Phdr", "Elf64_Shdr"],
    module: "/modules/02-elf-header",
  },
  {
    term: "Elf64_Phdr",
    short: "The C struct type for a 64-bit program header entry. 56 bytes.",
    long: "Fields: p_type (PT_LOAD/PT_INTERP/etc.), p_flags (PF_R|PF_W|PF_X), p_offset (file offset), p_vaddr (virtual address), p_paddr (physical address, usually same as vaddr), p_filesz (size in file), p_memsz (size in memory, >= filesz), p_align (alignment). The p_memsz > p_filesz gap is zero-filled (.bss).",
    category: "segments",
    cType: "Elf64_Phdr",
    seeAlso: ["Program Header Table", "PT_LOAD", "Elf64_Ehdr"],
    module: "/modules/05-segments-and-loading",
  },
  {
    term: "Elf64_Shdr",
    short: "The C struct type for a 64-bit section header entry. 64 bytes.",
    long: "Fields: sh_name (offset into .shstrtab), sh_type (SHT_PROGBITS/SHT_SYMTAB/etc.), sh_flags (SHF_WRITE|SHF_ALLOC|SHF_EXECINSTR), sh_addr (VA if loaded), sh_offset (file offset), sh_size, sh_link (related section index), sh_info (extra info), sh_addralign, sh_entsize (for fixed-size entry sections like .symtab).",
    category: "sections",
    cType: "Elf64_Shdr",
    seeAlso: ["Section Header Table", "Elf64_Ehdr"],
    module: "/modules/03-sections-vs-segments",
  },
  {
    term: "Elf64_Sym",
    short: "The C struct type for a symbol table entry. 24 bytes.",
    long: "Fields: st_name (offset into string table), st_info (binding in upper 4 bits + type in lower 4), st_other (visibility), st_shndx (section index or SHN_UNDEF/SHN_ABS), st_value (address or offset), st_size (symbol size in bytes). Binding: LOCAL/GLOBAL/WEAK. Type: NOTYPE/OBJECT/FUNC/SECTION/FILE.",
    category: "symbols",
    cType: "Elf64_Sym",
    seeAlso: ["Symbol", ".symtab", ".dynsym"],
    module: "/modules/04-sections-deep-dive",
  },
  {
    term: "Elf64_Rela",
    short: "The C struct type for a relocation entry with explicit addend. 24 bytes.",
    long: "Fields: r_offset (address to patch), r_info (symbol index in upper 32 bits + relocation type in lower 32), r_addend (constant to add). The formula depends on the type: R_X86_64_64 writes S + A, R_X86_64_PC32 writes S + A - P. The linker and dynamic linker both process these to fix up addresses.",
    category: "linking",
    cType: "Elf64_Rela",
    seeAlso: ["Relocation", ".rela.plt", ".rela.dyn"],
    module: "/modules/06-dynamic-linking",
  },
  {
    term: "Elf64_Dyn",
    short: "The C struct type for a .dynamic section entry. 16 bytes.",
    long: "Fields: d_tag (DT_NEEDED/DT_STRTAB/DT_SYMTAB/etc.) and d_val (value or address depending on tag). The .dynamic section is an array of these, terminated by DT_NULL. The dynamic linker reads this array to find symbol tables, string tables, relocations, needed libraries, and runtime flags.",
    category: "linking",
    cType: "Elf64_Dyn",
    seeAlso: [".dynamic", "DT_NEEDED", "Dynamic Linker"],
    module: "/modules/06-dynamic-linking",
  },
];

export default function JargonPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
        setExpanded(null);
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    return TERMS.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.aka?.some((a) => a.toLowerCase().includes(q)) ||
        t.cType?.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  const grouped = useMemo(() => {
    const letters = new Map<string, Term[]>();
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      if (!letters.has(key)) letters.set(key, []);
      letters.get(key)!.push(term);
    }
    return new Map([...letters.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filtered]);

  const categoryColor = (cat: Exclude<Category, "all">) =>
    CATEGORIES.find((c) => c.id === cat)?.color ?? "bg-zinc-600";

  const scrollToTerm = (termName: string) => {
    setExpanded(termName);
    setTimeout(() => {
      document.getElementById(`term-${termName}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            BinXray
          </Link>
          <span className="text-sm text-zinc-300">Jargon Reference</span>
          <Link
            href="/explorer"
            className="px-3 py-1 rounded-md text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Explorer
          </Link>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto px-4 pt-16 pb-8">
        <div className="text-blue-400 text-sm font-mono mb-2">REFERENCE</div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Binary Jargon
        </h1>
        <p className="text-zinc-400 max-w-2xl">
          Every term, struct, section, and acronym you'll encounter when working
          with binary formats. Searchable, categorized, and cross-linked.
        </p>
      </header>

      <div className="max-w-5xl mx-auto px-4 pb-24">
        <div className="sticky top-14 z-30 bg-zinc-950/95 backdrop-blur-sm pb-4 pt-2 -mx-4 px-4 border-b border-zinc-800/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms, structs, sections..."
                className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 font-mono">
                /
              </kbd>
            </div>
            <div className="flex items-center text-sm text-zinc-500">
              {filtered.length} of {TERMS.length}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  category === cat.id
                    ? `${cat.color} text-white`
                    : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {cat.label}
                {cat.id !== "all" && (
                  <span className="ml-1 opacity-60">
                    {TERMS.filter((t) => t.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              No terms match your search.
            </div>
          )}

          {[...grouped.entries()].map(([letter, terms]) => (
            <div key={letter} className="mb-8">
              <div className="sticky top-[140px] z-20 flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-zinc-600 w-8">
                  {letter}
                </span>
                <div className="flex-1 h-px bg-zinc-800/50" />
                <span className="text-xs text-zinc-600">
                  {terms.length}
                </span>
              </div>

              <div className="space-y-2 ml-8">
                {terms.map((term) => {
                  const isExpanded = expanded === term.term;
                  return (
                    <div
                      key={term.term}
                      id={`term-${term.term}`}
                      className={`rounded-xl border transition-all ${
                        isExpanded
                          ? "border-blue-500/30 bg-zinc-900/80"
                          : "border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setExpanded(isExpanded ? null : term.term)
                        }
                        className="w-full text-left px-4 py-3 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-zinc-100">
                              {term.term}
                            </span>
                            {term.cType && (
                              <code className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[11px] font-mono">
                                {term.cType}
                              </code>
                            )}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${categoryColor(
                                term.category
                              )} text-white/80`}
                            >
                              {term.category}
                            </span>
                          </div>
                          {term.aka && (
                            <div className="text-xs text-zinc-500 mt-0.5">
                              aka{" "}
                              {term.aka.map((a, i) => (
                                <span key={a}>
                                  {i > 0 && ", "}
                                  <span className="text-zinc-400">{a}</span>
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                            {term.short}
                          </p>
                        </div>
                        <svg
                          className={`w-4 h-4 text-zinc-500 shrink-0 mt-1 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-zinc-800/50 pt-3">
                              <p className="text-sm text-zinc-300 leading-relaxed">
                                {term.long}
                              </p>

                              {(term.seeAlso || term.module) && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                  {term.module && (
                                    <Link
                                      href={term.module}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                      </svg>
                                      Learn more
                                    </Link>
                                  )}
                                  {term.seeAlso?.map((ref) => {
                                    const exists = TERMS.some(
                                      (t) => t.term === ref
                                    );
                                    return exists ? (
                                      <button
                                        key={ref}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSearch("");
                                          setCategory("all");
                                          scrollToTerm(ref);
                                        }}
                                        className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs hover:text-zinc-200 hover:bg-zinc-700 transition-colors font-mono"
                                      >
                                        {ref}
                                      </button>
                                    ) : (
                                      <span
                                        key={ref}
                                        className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-500 text-xs font-mono"
                                      >
                                        {ref}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
