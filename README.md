<p align="center">
  <h1 align="center">Bin<strong>Xray</strong></h1>
  <p align="center">See through your binaries.</p>
</p>

<p align="center">
  <a href="https://github.com/zahidaz/bin-xray/actions"><img src="https://img.shields.io/github/actions/workflow/status/zahidaz/bin-xray/pages.yml?branch=main&style=flat-square&label=build" alt="Build Status"></a>
  <a href="https://github.com/zahidaz/bin-xray"><img src="https://img.shields.io/github/stars/zahidaz/bin-xray?style=flat-square&color=blue" alt="Stars"></a>
  <a href="https://github.com/zahidaz/bin-xray/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zahidaz/bin-xray?style=flat-square" alt="License"></a>
  <a href="https://zahidaz.github.io/bin-xray"><img src="https://img.shields.io/badge/demo-live-brightgreen?style=flat-square" alt="Live Demo"></a>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://www.framer.com/motion"><img src="https://img.shields.io/badge/Framer_Motion-animation-FF0050?style=flat-square" alt="Framer Motion"></a>
</p>

---

An interactive web app for understanding binary executable formats. Click bytes, explore structs, watch dynamic linking happen — all in your browser. No backend, no installs.

**Currently supports ELF.** Mach-O and PE support planned.

## Features

### Interactive Hex Viewer
Virtualized hex dump with color-coded regions, byte-level tooltips, click-to-inspect, and pattern search. Handles binaries of any size smoothly.

### Struct Viewer
C struct definitions alongside live decoded values. Hover a field and the corresponding bytes highlight in the hex viewer — and vice versa. Supports all ELF structs: `Elf64_Ehdr`, `Elf64_Phdr`, `Elf64_Shdr`, `Elf64_Sym`, `Elf64_Rela`, `Elf64_Dyn`.

### Memory Map Visualizer
See how file bytes map to virtual address space. Animated SVG arrows connect disk offsets to memory addresses. BSS gaps, permission flags, and segment boundaries — all visualized.

### PLT/GOT Animator
Step through lazy dynamic linking one instruction at a time. Watch the PLT stub, GOT entry, and dynamic resolver interact across 5 animated steps with play/pause/step controls.

### Section & Segment Toggle
Switch between the linker's view (sections) and the loader's view (segments) of the same binary. See which sections collapse into which segments and why.

### Compilation Pipeline
Trace the journey from `hello.c` through preprocessing, compilation, assembly, and linking. See what the linker adds: PLT, GOT, `.interp`, `.dynamic`.

### Jargon Reference
68 searchable, categorized, cross-linked terms covering ELF structure, sections, segments, symbols, linking, memory, toolchain, and CPU/OS concepts.

## Modules

| # | Module | What You'll Learn |
|---|--------|-------------------|
| 0 | **What happens when you run ./hello?** | The full journey from shell to CPU |
| 1 | **From Source to Binary** | Preprocessing → compilation → assembly → linking |
| 2 | **The ELF Header** | First 64 bytes: magic, type, entry point, table offsets |
| 3 | **Sections vs Segments** | Linker's view vs loader's view of the same file |
| 4 | **Sections Deep Dive** | .text, .data, .bss, .symtab, .rodata in detail |
| 5 | **Segments and Loading** | PT_LOAD, PT_INTERP, memory mapping, permissions |
| 6 | **Dynamic Linking** | PLT/GOT, lazy binding, .dynamic, relocations |
| 7 | **Full Explorer** | All tools unlocked — load any binary or upload your own |

## Quick Start

```bash
git clone https://github.com/zahidaz/bin-xray.git
cd bin-xray
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sample Binaries

Pre-built ELF binaries included in `public/samples/`:

| Binary | Purpose |
|--------|---------|
| `hello-dynamic.bin` | Dynamically linked — PLT/GOT, `.interp`, `.dynamic` |
| `hello-static.bin` | Statically linked — no dynamic sections |
| `hello.o` | Object file — sections only, no program headers |
| `libhello.so` | Shared library — `ET_DYN`, exported symbols |
| `hello-stripped.bin` | Stripped — no `.symtab` or `.strtab` |

To regenerate from source (requires Linux with GCC):

```bash
bash scripts/generate-samples.sh
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| State | Zustand |
| Virtualization | @tanstack/react-virtual |
| Deployment | Static — works on GitHub Pages, Vercel, Netlify, any CDN |

## Project Structure

```
src/
  app/                          # Next.js pages
    page.tsx                    # Landing page
    explorer/page.tsx           # Full binary explorer
    jargon/page.tsx             # Jargon reference
    modules/[slug]/             # Learning modules 1-6
  components/
    hex-viewer/                 # Interactive hex dump (6 files)
    struct-viewer/              # C struct visualization (4 files)
    memory-map/                 # Disk → memory mapping (4 files)
    plt-got/                    # PLT/GOT animation (6 files)
    pipeline/                   # Compilation pipeline (3 files)
    section-segment/            # Section/segment toggle (3 files)
    narrative/                  # Chapter layout, scroll, quiz (4 files)
    shared/                     # Tooltip, toggle, uploader (5 files)
  lib/
    elf/                        # Pure TypeScript ELF parser (12 files)
    store/                      # Zustand stores (binary + UI)
    hooks/                      # Custom React hooks
  config/                       # Struct metadata definitions
public/
  samples/                      # Pre-built ELF binaries
scripts/
  generate-samples.sh           # Build samples on Linux
  generate-sample-elf.ts        # Generate synthetic samples
```

## Roadmap

- [ ] Mach-O format support (macOS binaries)
- [ ] PE format support (Windows binaries)
- [ ] Auto-detect format from magic bytes
- [ ] DWARF debug info viewer
- [ ] Disassembly view (x86-64, ARM64)
- [ ] Binary diffing (side-by-side comparison)
- [ ] Challenge mode with interactive quizzes

## Static Export

The app exports as a fully static site — no server required:

```bash
npm run build
# Output in ./out — deploy anywhere
```

## License

MIT
