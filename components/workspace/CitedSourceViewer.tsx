"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentCitation } from "@/hooks/use-agent-chat";
import type { Repository } from "@/hooks/use-repository";
import { buildGitHubFileUrl, buildVsCodeUrl } from "./InlineCitations";

interface CitedSourceViewerProps {
  citations: AgentCitation[];
  repoName: string;
  repository?: Repository | null;
  activeCitation?: AgentCitation | null;
  onSelectCitation?: (citation: AgentCitation) => void;
}

interface FileSnippetGroup {
  filePath: string;
  citations: AgentCitation[];
}

export function CitedSourceViewer({
  citations,
  repoName,
  repository,
  activeCitation,
  onSelectCitation,
}: CitedSourceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [collapsedFiles, setCollapsedFiles] = useState<Record<string, boolean>>({});
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState<number>(0);

  // Group citations by filePath
  const fileGroups = React.useMemo(() => {
    const groups: FileSnippetGroup[] = [];
    const map = new Map<string, AgentCitation[]>();

    for (const c of citations) {
      if (!map.has(c.filePath)) {
        map.set(c.filePath, []);
      }
      map.get(c.filePath)!.push(c);
    }

    for (const [filePath, cList] of map.entries()) {
      groups.push({ filePath, citations: cList });
    }
    return groups;
  }, [citations]);

  // Handle auto-scrolling when activeCitation changes
  useEffect(() => {
    if (!activeCitation) return;
    const targetEl = cardRefs.current.get(activeCitation.filePath);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      // Ensure file is expanded
      setCollapsedFiles((prev) => ({ ...prev, [activeCitation.filePath]: false }));
    }
    const idx = citations.findIndex(
      (c) => c.filePath === activeCitation.filePath && c.lineRange === activeCitation.lineRange
    );
    if (idx !== -1) {
      setActiveSnippetIdx(idx);
    }
  }, [activeCitation, citations]);

  const toggleCollapse = (filePath: string) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [filePath]: !prev[filePath],
    }));
  };

  const handleCopyCode = async (filePath: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(filePath);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      // fallback
    }
  };

  const jumpToPrevCitation = () => {
    if (citations.length === 0) return;
    const prevIdx = (activeSnippetIdx - 1 + citations.length) % citations.length;
    const target = citations[prevIdx];
    if (target && onSelectCitation) {
      onSelectCitation(target);
    }
  };

  const jumpToNextCitation = () => {
    if (citations.length === 0) return;
    const nextIdx = (activeSnippetIdx + 1) % citations.length;
    const target = citations[nextIdx];
    if (target && onSelectCitation) {
      onSelectCitation(target);
    }
  };

  if (citations.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center border-l border-white/5 bg-slate-950/40">
        <div className="rounded-full bg-white/5 p-3 text-white/40 mb-3 border border-white/10">
          <Code2 className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-medium text-white/80">Cited Sources</h4>
        <p className="mt-1 text-xs text-white/40 max-w-xs leading-relaxed">
          Source code snippets cited in the answer will be highlighted and displayed here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col border-l border-white/5 bg-slate-950/60 overflow-hidden">
      {/* Pane Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-black/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-display text-xs font-semibold text-white/90">
            Cited Sources
          </span>
          <span className="rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[10px] font-mono text-primary">
            {citations.length} snippet{citations.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-[11px] font-mono text-white/40">
          {activeSnippetIdx + 1} / {citations.length}
        </div>
      </div>

      {/* Independently Scrollable Snippet Cards Stack */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
      >
        {fileGroups.map((group) => {
          const isCollapsed = !!collapsedFiles[group.filePath];
          const isGroupActive = group.citations.some(
            (c) => activeCitation && c.filePath === activeCitation.filePath
          );

          // Get primary citation line range & snippet
          const primaryCitation = group.citations[0];
          const githubUrl = buildGitHubFileUrl(
            repository,
            group.filePath,
            primaryCitation.lineRange
          );
          const vsCodeUrl = buildVsCodeUrl(
            repository,
            group.filePath,
            primaryCitation.lineRange
          );

          // Format code lines
          const snippetText = primaryCitation.snippet || `// File: ${group.filePath}
// Snippet for cited reference ${primaryCitation.lineRange ? `lines ${primaryCitation.lineRange}` : ""}
// Source code chunk retrieved from vector database`;

          const rawLines = snippetText.split("\n");
          let startLine = 1;
          let endLine = rawLines.length;

          if (primaryCitation.lineRange) {
            const rangeMatch = primaryCitation.lineRange.match(/(\d+)-?(\d+)?/);
            if (rangeMatch) {
              startLine = parseInt(rangeMatch[1], 10);
              if (rangeMatch[2]) endLine = parseInt(rangeMatch[2], 10);
            }
          }

          return (
            <div
              key={group.filePath}
              ref={(el) => {
                if (el) cardRefs.current.set(group.filePath, el);
                else cardRefs.current.delete(group.filePath);
              }}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                isGroupActive
                  ? "border-primary/50 bg-slate-900/90 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-primary/40"
                  : "border-white/10 bg-slate-900/50 hover:border-white/20"
              )}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/40 border-b border-white/5">
                <div
                  onClick={() => toggleCollapse(group.filePath)}
                  className="flex items-center gap-2 cursor-pointer min-w-0 flex-1 select-none"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-white/50 transition-transform duration-200 shrink-0",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-mono text-[11px] text-white/40 shrink-0">
                    {repoName}/
                  </span>
                  <span className="font-mono text-xs text-white font-medium truncate">
                    {group.filePath}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {vsCodeUrl && (
                    <a
                      href={vsCodeUrl}
                      title="Open in VS Code"
                      className="px-1.5 py-0.5 text-[10px] font-mono text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded transition-colors"
                    >
                      VSCode
                    </a>
                  )}

                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on GitHub"
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopyCode(group.filePath, snippetText)}
                    title="Copy snippet"
                    className="p-1 text-white/40 hover:text-white transition-colors"
                  >
                    {copiedFile === group.filePath ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Body Code Block */}
              {!isCollapsed && (
                <div className="overflow-x-auto bg-black/60 font-mono text-[11px] leading-relaxed p-2 scrollbar-thin">
                  <table className="w-full border-collapse">
                    <tbody>
                      {rawLines.map((line, idx) => {
                        const currentLineNum = startLine + idx;
                        const isHighlighted =
                          primaryCitation.lineRange &&
                          currentLineNum >= startLine &&
                          currentLineNum <= endLine;

                        return (
                          <tr
                            key={idx}
                            className={cn(
                              "transition-colors",
                              isHighlighted
                                ? "bg-primary/20 border-l-2 border-primary text-sky-200"
                                : "hover:bg-white/5 text-white/70"
                            )}
                          >
                            <td className="w-10 select-none text-right pr-3 text-[10px] text-white/30 font-mono">
                              {currentLineNum}
                            </td>
                            <td className="whitespace-pre pl-2 py-0.5 font-mono">
                              {line || " "}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Up/Down Quick Navigation Jump Chevrons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-full border border-white/10 bg-black/80 p-1 backdrop-blur-md shadow-lg z-20">
        <button
          type="button"
          onClick={jumpToPrevCitation}
          title="Previous cited snippet"
          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <div className="h-[1px] w-full bg-white/10" />
        <button
          type="button"
          onClick={jumpToNextCitation}
          title="Next cited snippet"
          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
