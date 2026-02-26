<div align="center">

# Bin**Xray**

### See through your binaries.

An interactive web app for understanding binary executable formats.<br>
Click bytes, explore structs, watch dynamic linking happen — all in your browser.

<br>

[**Try the Live Demo**](https://zahidaz.github.io/bin-xray)

<br>

[![Build](https://img.shields.io/github/actions/workflow/status/zahidaz/bin-xray/pages.yml?branch=main&style=for-the-badge&label=build&logo=githubactions&logoColor=white)](https://github.com/zahidaz/bin-xray/actions)
[![Stars](https://img.shields.io/github/stars/zahidaz/bin-xray?style=for-the-badge&color=f5c542&logo=github)](https://github.com/zahidaz/bin-xray)
[![License](https://img.shields.io/github/license/zahidaz/bin-xray?style=for-the-badge&color=blue)](https://github.com/zahidaz/bin-xray/blob/main/LICENSE)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel&logoColor=white)](https://zahidaz.github.io/bin-xray)

<br>

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-FF0050?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)

</div>

<br>

> **Currently supports ELF.** Mach-O and PE support planned.

No backend. No installs. The entire ELF parser runs client-side in your browser.

<br>

## What's Inside

<table>
<tr>
<td width="50%">

### Interactive Hex Viewer
Virtualized hex dump with color-coded regions, byte-level tooltips, click-to-inspect, and pattern search. Handles binaries of any size.

</td>
<td width="50%">

### Struct Viewer
C struct definitions alongside live decoded values. Hover a field and the corresponding bytes highlight — and vice versa. All ELF structs supported.

</td>
</tr>
<tr>
<td width="50%">

### Memory Map Visualizer
See how file bytes map to virtual address space. Animated SVG arrows connect disk offsets to memory addresses. BSS gaps, permissions — all visualized.

</td>
<td width="50%">

### PLT/GOT Animator
Step through lazy dynamic linking one instruction at a time. 5 animated steps with play/pause/step controls.

</td>
</tr>
<tr>
<td width="50%">

### Section & Segment Toggle
Switch between the linker's view (sections) and the loader's view (segments) of the same binary.

</td>
<td width="50%">

### Compilation Pipeline
Trace the journey from `hello.c` through preprocessing, compilation, assembly, and linking.

</td>
</tr>
</table>

**Plus:** 68 searchable, categorized, cross-linked jargon terms covering ELF structure, symbols, linking, memory, and more.

<br>

## Learning Modules

| | Module | What You'll Learn |
|:---:|--------|-------------------|
| **0** | What happens when you run `./hello`? | The full journey from shell to CPU |
| **1** | From Source to Binary | Preprocessing → compilation → assembly → linking |
| **2** | The ELF Header | First 64 bytes: magic, type, entry point, table offsets |
| **3** | Sections vs Segments | Linker's view vs loader's view of the same file |
| **4** | Sections Deep Dive | `.text`, `.data`, `.bss`, `.symtab`, `.rodata` in detail |
| **5** | Segments and Loading | `PT_LOAD`, `PT_INTERP`, memory mapping, permissions |
| **6** | Dynamic Linking | PLT/GOT, lazy binding, `.dynamic`, relocations |
| **7** | Full Explorer | All tools unlocked — load any binary or upload your own |

<br>

## Quick Start

```bash
git clone https://github.com/zahidaz/bin-xray.git
cd bin-xray
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) and start exploring.

<br>

## Sample Binaries

Pre-built ELF binaries in `public/samples/`:

| Binary | What makes it interesting |
|--------|--------------------------|
| `hello-dynamic.bin` | Dynamically linked — PLT/GOT, `.interp`, `.dynamic` |
| `hello-static.bin` | Statically linked — no dynamic sections |
| `hello.o` | Object file — sections only, no program headers |
| `libhello.so` | Shared library — `ET_DYN`, exported symbols |
| `hello-stripped.bin` | Stripped — no `.symtab` or `.strtab` |

<details>
<summary>Regenerate from source (requires Linux + GCC)</summary>

```bash
bash scripts/generate-samples.sh
```

</details>

<br>

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 15 (App Router, static export) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **State** | Zustand |
| **Virtualization** | @tanstack/react-virtual |
| **Deployment** | Static — GitHub Pages, Vercel, Netlify, any CDN |

<br>

## Project Structure

```
src/
  app/
    page.tsx                        Landing page
    explorer/page.tsx               Full binary explorer
    jargon/page.tsx                 Jargon reference
    modules/[slug]/                 Learning modules 1–6
  components/
    hex-viewer/                     Interactive hex dump (6 files)
    struct-viewer/                  C struct visualization (4 files)
    memory-map/                     Disk → memory mapping (4 files)
    plt-got/                        PLT/GOT animation (6 files)
    pipeline/                       Compilation pipeline (3 files)
    section-segment/                Section/segment toggle (3 files)
    narrative/                      Chapter layout, scroll, quiz (4 files)
    shared/                         Tooltip, toggle, uploader (5 files)
  lib/
    elf/                            Pure TypeScript ELF parser (12 files)
    store/                          Zustand stores (binary + UI)
    hooks/                          Custom React hooks
  config/                           Struct metadata definitions
public/
  samples/                          Pre-built ELF binaries
scripts/
  generate-samples.sh               Build samples on Linux
  generate-sample-elf.ts            Generate synthetic samples
```

<br>

## Roadmap

- [ ] Mach-O format support (macOS binaries)
- [ ] PE format support (Windows binaries)
- [ ] Auto-detect format from magic bytes
- [ ] DWARF debug info viewer
- [ ] Disassembly view (x86-64, ARM64)
- [ ] Binary diffing (side-by-side comparison)
- [ ] Challenge mode with interactive quizzes

<br>

## Deploy Your Own

The app exports as a fully static site — no server required:

```bash
npm run build
```

Output lands in `./out`. Drop it on any static host.

<br>

## License

[MIT](LICENSE)
