"use client";

import { cn } from "@/lib/utils";
import type { HeadingItem } from "./wiki-helpers";

interface ArchitectureWikiTocProps {
  headings: HeadingItem[];
  activeHeading: string;
  onHeadingSelect: (id: string) => void;
}

export function ArchitectureWikiToc({
  headings,
  activeHeading,
  onHeadingSelect,
}: ArchitectureWikiTocProps) {
  if (headings.length <= 1) return null;

  return (
    <aside className="hidden h-full w-52 shrink-0 border-l border-white/5 lg:block overflow-y-auto py-6 pl-4 pr-3 no-scrollbar">
      <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
        On this page
      </div>
      <nav className="flex flex-col gap-0.5">
        {headings.map((h) => (
          <button
            key={h.id}
            onClick={() => onHeadingSelect(h.id)}
            className={cn(
              "rounded px-2 py-1 text-left transition-colors duration-150 cursor-pointer",
              h.level === 1 && "font-medium",
              h.level === 2 && "pl-3",
              h.level === 3 && "pl-5",
              activeHeading === h.id
                ? "text-primary text-[12px]"
                : "text-muted-foreground/60 hover:text-white/70 text-[11px]"
            )}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </aside>
  );
}
