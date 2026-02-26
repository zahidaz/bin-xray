"use client";

import type { ReactNode } from "react";

type CalloutVariant = "insight" | "warning" | "info" | "question";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const VARIANT_STYLES: Record<
  CalloutVariant,
  { border: string; bg: string; icon: string; title: string }
> = {
  insight: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    icon: "💡",
    title: "text-yellow-400",
  },
  warning: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: "⚠️",
    title: "text-red-400",
  },
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: "ℹ️",
    title: "text-blue-400",
  },
  question: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    icon: "🤔",
    title: "text-purple-400",
  },
};

export function Callout({
  variant = "info",
  title,
  children,
}: CalloutProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`rounded-xl border ${styles.border} ${styles.bg} p-5 my-6`}
    >
      {title && (
        <div className={`flex items-center gap-2 mb-2 font-semibold ${styles.title}`}>
          <span>{styles.icon}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="text-zinc-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
