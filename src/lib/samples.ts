export interface SampleBinary {
  name: string;
  file: string;
  description: string;
}

export const SAMPLE_BINARIES: SampleBinary[] = [
  {
    name: "hello-dynamic",
    file: "hello-dynamic.bin",
    description: "Dynamically linked executable with PLT/GOT, .interp, .dynamic",
  },
  {
    name: "hello-static",
    file: "hello-static.bin",
    description: "Statically linked — no dynamic sections, no PLT/GOT",
  },
  {
    name: "hello.o",
    file: "hello.o",
    description: "Object file before linking — sections only, no program headers",
  },
  {
    name: "libhello.so",
    file: "libhello.so",
    description: "Shared library — ET_DYN with exported symbols and PIC",
  },
  {
    name: "hello-stripped",
    file: "hello-stripped.bin",
    description: "Stripped binary — no .symtab or .strtab",
  },
];

export const DEFAULT_SAMPLE = "hello-dynamic.bin";
