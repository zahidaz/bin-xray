"use client";

import type { StructFieldMeta } from "@/lib/elf/types";
import { EnumValue } from "./EnumValue";
import { formatHex } from "@/lib/elf/decode";

interface StructFieldProps {
  field: StructFieldMeta;
  baseOffset: number;
  buffer: ArrayBuffer;
  isHovered: boolean;
  onHover: (field: StructFieldMeta | null) => void;
  onClick: (field: StructFieldMeta) => void;
}

function readFieldValue(
  buffer: ArrayBuffer,
  baseOffset: number,
  field: StructFieldMeta
): { raw: Uint8Array; value: number | bigint } {
  const view = new DataView(buffer);
  const abs = baseOffset + field.offset;

  if (abs + field.size > buffer.byteLength) {
    return { raw: new Uint8Array(field.size), value: 0 };
  }

  const raw = new Uint8Array(buffer, abs, field.size);

  let value: number | bigint = 0;
  switch (field.type) {
    case "u8":
      value = view.getUint8(abs);
      break;
    case "u16":
      value = view.getUint16(abs, true);
      break;
    case "u32":
      value = view.getUint32(abs, true);
      break;
    case "u64":
      value = view.getBigUint64(abs, true);
      break;
    case "bytes":
      value = 0;
      break;
  }

  return { raw: new Uint8Array(raw), value };
}

function formatRawBytes(raw: Uint8Array): string {
  return Array.from(raw)
    .map((b) => formatHex(b))
    .join(" ");
}

function formatValue(value: number | bigint, type: StructFieldMeta["type"]): string {
  if (type === "bytes") return "";
  if (type === "u64") {
    return `0x${(value as bigint).toString(16)}`;
  }
  return `0x${(value as number).toString(16)}`;
}

export function StructField({
  field,
  baseOffset,
  buffer,
  isHovered,
  onHover,
  onClick,
}: StructFieldProps) {
  const { raw, value } = readFieldValue(buffer, baseOffset, field);
  const rawHex = formatRawBytes(raw);
  const formattedValue = formatValue(value, field.type);
  const decoded = field.decode ? field.decode(value) : null;

  return (
    <tr
      className={`cursor-pointer border-b border-zinc-800 transition-colors ${
        isHovered
          ? "bg-violet-500/10"
          : "hover:bg-zinc-800/50"
      }`}
      onMouseEnter={() => onHover(field)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(field)}
    >
      <td className="whitespace-nowrap px-3 py-2 font-mono text-sm text-amber-300">
        {field.name}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-zinc-500">
        0x{formatHex(baseOffset + field.offset, 4)}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-center font-mono text-xs text-zinc-500">
        {field.size}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-emerald-400">
        {rawHex}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-sky-300">
        {formattedValue}
      </td>
      <td className="px-3 py-2">
        {decoded ? (
          <EnumValue
            rawValue={formattedValue || rawHex}
            decodedValue={decoded}
          />
        ) : (
          <span className="text-xs text-zinc-600">-</span>
        )}
      </td>
    </tr>
  );
}
