"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArchDocSection } from "@/hooks/use-arch-doc";
import { extractHeadings } from "./wiki-helpers";

interface ArchitectureWikiSidebarProps {
  sections: ArchDocSection[];
  activeSection: string;
  activeHeading: string;
  sidebarOpen: boolean;
  onSectionSelect: (key: string) => void;
  onHeadingSelect: (id: string) => void;
}

export function ArchitectureWikiSidebar({
  sections,
  activeSection,
  activeHeading,
  sidebarOpen,
  onSectionSelect,
  onHeadingSelect,
}: ArchitectureWikiSidebarProps) {
  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="shrink-0 h-full overflow-hidden border-r border-white/5 bg-background/40 backdrop-blur-sm"
        >
          <div className="flex h-full w-60 flex-col overflow-y-auto py-4 no-scrollbar">
            <div className="mb-3 px-4 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
              Sections
            </div>
            <nav className="flex flex-col gap-0.5 px-2">
              {sections.map((section) => {
                const isActive = section.key === activeSection;
                const headings = extractHeadings(section.contentMd).filter(
                  (h) => h.level === 2
                );
                return (
                  <div key={section.key}>
                    <button
                      onClick={() => onSectionSelect(section.key)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-all duration-150 cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-white"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white/80"
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 shrink-0 transition-transform duration-150",
                          isActive ? "rotate-90 text-primary" : "text-muted-foreground/40"
                        )}
                      />
                      <span className="truncate font-medium text-[13px]">
                        {section.title}
                      </span>
                      {section.verified && (
                        <CheckCircle2 className="ml-auto h-3 w-3 shrink-0 text-emerald-500/70" />
                      )}
                    </button>
                    {isActive && headings.length > 0 && (
                      <div className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l border-white/5 pl-3">
                        {headings.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => onHeadingSelect(h.id)}
                            className={cn(
                              "truncate rounded py-1 px-2 text-left text-[11px] transition-colors cursor-pointer",
                              activeHeading === h.id
                                ? "text-primary"
                                : "text-muted-foreground/60 hover:text-white/70"
                            )}
                          >
                            {h.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
