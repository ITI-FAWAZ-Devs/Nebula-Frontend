"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentCitation } from "@/hooks/use-agent-chat";
import type { Repository } from "@/hooks/use-repository";
import { MermaidDiagram } from "./MermaidDiagram";
import { getGithubFileUrl } from "./github-utils";

export function DependencyGraphPanel({ diagram }: { diagram: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-lg border border-white/5 bg-white/2 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <svg className="h-3 w-3 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Dependency Graph
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 pb-4 pt-4">
              <MermaidDiagram chart={diagram} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SourceFilesPanel({
  files,
  repoName,
  commitSha,
}: {
  files: string[];
  repoName: string;
  commitSha?: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-lg border border-white/5 bg-white/2 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <FileText className="h-3 w-3" />
          {files.length} source file{files.length !== 1 ? "s" : ""}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
              {files.map((f) => {
                const url = getGithubFileUrl(repoName, f, commitSha);
                return (
                  <a
                    key={f}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/80 hover:bg-primary/20 hover:border-primary/40 hover:text-white transition-all cursor-pointer group"
                  >
                    <FileText className="h-3 w-3 text-primary/70 group-hover:text-primary transition-colors" />
                    <span>{f}</span>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function buildGithubBlobUrl(
  citation: AgentCitation,
  repository?: Repository | null
): string | null {
  if (!repository) return null;
  const { owner, name, defaultBranch } = repository;
  if (!owner || !name) return null;
  const base = `https://github.com/${owner}/${name}/blob/${defaultBranch}/${citation.filePath}`;
  if (citation.lineRange) {
    const [start, end] = citation.lineRange.split("-");
    return `${base}#L${start}${end ? `-L${end}` : ""}`;
  }
  return base;
}

export function CitationBadges({
  citations,
  repository,
}: {
  citations: AgentCitation[];
  repository?: Repository | null;
}) {
  if (!citations.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((c, i) => {
        const href = buildGithubBlobUrl(c, repository);
        const label = c.filePath.split("/").slice(-1)[0] ?? c.filePath;
        const title = c.lineRange ? `${c.filePath}:${c.lineRange}` : c.filePath;
        const inner = (
          <>
            <FileText className="h-2.5 w-2.5 text-primary/50 shrink-0" />
            {label}
            {c.lineRange && (
              <span className="text-white/30">:{c.lineRange}</span>
            )}
          </>
        );
        if (href) {
          return (
            <a
              key={`${c.nodeId}-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60 hover:border-primary/40 hover:text-white/90 transition-colors"
            >
              {inner}
            </a>
          );
        }
        return (
          <span
            key={`${c.nodeId}-${i}`}
            title={title}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60"
          >
            {inner}
          </span>
        );
      })}
    </div>
  );
}
