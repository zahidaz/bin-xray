"use client";

import { type ReactNode } from "react";
import Link from "next/link";

interface ChapterLayoutProps {
  title: string;
  moduleNumber: number;
  children: ReactNode;
  prevSlug?: string;
  nextSlug?: string;
}

const MODULE_TITLES = [
  "What happens when you run ./hello?",
  "From Source to Binary",
  "The ELF Header",
  "Sections vs Segments",
  "Sections Deep Dive",
  "Segments and Loading",
  "Dynamic Linking",
  "Full Explorer",
];

export function ChapterLayout({
  title,
  moduleNumber,
  children,
  prevSlug,
  nextSlug,
}: ChapterLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            BinXray
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Module {moduleNumber}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">{title}</span>
          </div>
          <div className="flex gap-2">
            <Link
              href="/jargon"
              className="px-3 py-1 rounded-md text-sm bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Jargon
            </Link>
            {prevSlug && (
              <Link
                href={`/modules/${prevSlug}`}
                className="px-3 py-1 rounded-md text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Prev
              </Link>
            )}
            {nextSlug && (
              <Link
                href={`/modules/${nextSlug}`}
                className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-4 pt-16 pb-8">
        <div className="text-blue-400 text-sm font-mono mb-2">
          MODULE {moduleNumber}
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-24">{children}</main>

      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-800">
        <div className="flex justify-between items-center">
          {prevSlug ? (
            <Link
              href={`/modules/${prevSlug}`}
              className="group flex flex-col"
            >
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                Previous
              </span>
              <span className="text-sm text-zinc-300 group-hover:text-white">
                {MODULE_TITLES[moduleNumber - 1] ?? ""}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextSlug ? (
            <Link
              href={`/modules/${nextSlug}`}
              className="group flex flex-col text-right"
            >
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                Next
              </span>
              <span className="text-sm text-zinc-300 group-hover:text-white">
                {MODULE_TITLES[moduleNumber + 1] ?? ""}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </footer>
    </div>
  );
}
