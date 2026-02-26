"use client";

import { motion } from "framer-motion";
import { getSegmentColor } from "@/lib/colors";

interface MappingArrowProps {
  fromY: number;
  toY: number;
  fromHeight: number;
  toHeight: number;
  segmentIndex: number;
  isHovered: boolean;
  width: number;
  containerTop: number;
}

export function MappingArrow({
  fromY,
  toY,
  fromHeight,
  toHeight,
  segmentIndex,
  isHovered,
  width,
  containerTop,
}: MappingArrowProps) {
  const color = getSegmentColor(segmentIndex);
  const leftTopY = fromY - containerTop;
  const leftBottomY = leftTopY + fromHeight;
  const rightTopY = toY - containerTop;
  const rightBottomY = rightTopY + toHeight;

  const cpx1 = width * 0.35;
  const cpx2 = width * 0.65;

  const topPath = `M 0,${leftTopY} C ${cpx1},${leftTopY} ${cpx2},${rightTopY} ${width},${rightTopY}`;
  const bottomPath = `M 0,${leftBottomY} C ${cpx1},${leftBottomY} ${cpx2},${rightBottomY} ${width},${rightBottomY}`;

  return (
    <g>
      <motion.path
        d={topPath}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? 2 : 1}
        strokeOpacity={isHovered ? 0.8 : 0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.path
        d={bottomPath}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? 2 : 1}
        strokeOpacity={isHovered ? 0.8 : 0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
      />
      <motion.path
        d={`${topPath} L ${width},${rightBottomY} C ${cpx2},${rightBottomY} ${cpx1},${leftBottomY} 0,${leftBottomY} Z`}
        fill={color}
        fillOpacity={isHovered ? 0.12 : 0.04}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
    </g>
  );
}
