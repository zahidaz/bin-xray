#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$PROJECT_DIR/public/samples"
SRC_DIR=$(mktemp -d)

mkdir -p "$OUT_DIR"

cat > "$SRC_DIR/hello.c" << 'CSRC'
#include <stdio.h>
#include <stdlib.h>

const char *greeting = "Hello, ELF Explorer!";
const int magic_number = 42;

int global_counter = 0;
char global_buffer[256];

static int add(int a, int b) {
    return a + b;
}

void print_greeting(void) {
    printf("%s\n", greeting);
    global_counter++;
}

int compute(int x) {
    int result = add(x, magic_number);
    global_counter++;
    return result;
}

int main(int argc, char *argv[]) {
    print_greeting();

    int val = compute(argc);
    printf("Result: %d\n", val);
    printf("Counter: %d\n", global_counter);

    if (argc > 1) {
        printf("Arg: %s\n", argv[1]);
    }

    return EXIT_SUCCESS;
}
CSRC

cat > "$SRC_DIR/libhello.c" << 'CSRC'
#include <stdio.h>

const char *lib_version = "1.0.0";
int lib_call_count = 0;

void hello_lib(const char *name) {
    printf("Hello from libhello, %s!\n", name);
    lib_call_count++;
}

int hello_add(int a, int b) {
    lib_call_count++;
    return a + b;
}
CSRC

echo "Compiling dynamically-linked executable..."
gcc -O0 -g -no-pie -o "$OUT_DIR/hello-dynamic.bin" "$SRC_DIR/hello.c"

echo "Compiling statically-linked executable..."
gcc -O0 -g -static -o "$OUT_DIR/hello-static.bin" "$SRC_DIR/hello.c"

echo "Compiling object file..."
gcc -O0 -g -c -o "$OUT_DIR/hello.o" "$SRC_DIR/hello.c"

echo "Compiling shared library..."
gcc -O0 -g -shared -fPIC -o "$OUT_DIR/libhello.so" "$SRC_DIR/libhello.c"

echo "Creating stripped binary..."
cp "$OUT_DIR/hello-dynamic.bin" "$OUT_DIR/hello-stripped.bin"
strip "$OUT_DIR/hello-stripped.bin"

echo ""
echo "Generated samples:"
ls -la "$OUT_DIR/"

echo ""
echo "Verification with readelf:"
for f in "$OUT_DIR"/*; do
    echo "--- $(basename "$f") ---"
    readelf -h "$f" 2>/dev/null | head -5 || echo "(not an ELF or readelf not available)"
    echo ""
done

rm -rf "$SRC_DIR"
echo "Done!"
