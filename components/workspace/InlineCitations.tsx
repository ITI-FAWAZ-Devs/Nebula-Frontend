"use client";

import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import type { AgentCitation } from "@/hooks/use-agent-chat";
import type { Repository } from "@/hooks/use-repository";

export function buildGitHubFileUrl(
  repository?: Repository | null,
  filePath?: string,
  lineRange?: string | null
): string | null {
  if (!repository || !filePath) return null;
  const cloneUrl = repository.cloneUrl || "";

  let webUrl = cloneUrl
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");

  if (!webUrl.startsWith("http")) {
    webUrl = `https://github.com/${repository.owner}/${repository.name}`;
  }

  const branch = repository.defaultBranch || "main";
  let url = `${webUrl}/blob/${branch}/${filePath.replace(/^\//, "")}`;

  if (lineRange) {
    const match = lineRange.match(/(\d+)-?(\d+)?/);
    if (match) {
      const start = match[1];
      const end = match[2];
      url += end ? `#L${start}-L${end}` : `#L${start}`;
    }
  }

  return url;
}

export function buildVsCodeUrl(
  repository?: Repository | null,
  filePath?: string,
  lineRange?: string | null
): string | null {
  const localPath = (repository as any)?.localPath;
  if (!localPath || !filePath) return null;
  const cleanPath = filePath.replace(/^\//, "");
  const line = lineRange ? lineRange.split("-")[0] : "1";
  return `vscode://file/${localPath}/${cleanPath}:${line}`;
}

export function InlineCitationPill({
  citation,
  index,
  repository,
  onSelectCitation,
}: {
  citation: AgentCitation;
  index?: number;
  repository?: Repository | null;
  onSelectCitation?: (citation: AgentCitation) => void;
}) {
  const url = buildGitHubFileUrl(repository, citation.filePath, citation.lineRange);
  const fileName = citation.filePath.split("/").pop() || citation.filePath;
  const label = citation.lineRange ? `${fileName}:${citation.lineRange}` : fileName;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelectCitation) {
      e.preventDefault();
      onSelectCitation(citation);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 mx-0.5 my-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 font-mono text-[11px] font-medium text-sky-300 hover:bg-sky-500/25 hover:border-sky-400 hover:text-sky-100 transition-all cursor-pointer shadow-sm select-none"
      title={`Jump to source: ${citation.filePath}${citation.lineRange ? `:${citation.lineRange}` : ""}`}
    >
      <FileText className="h-3 w-3 text-sky-400 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

export function InlineCitationBadge({
  citation,
  index,
  repository,
  onSelectCitation,
}: {
  citation: AgentCitation;
  index: number;
  repository?: Repository | null;
  onSelectCitation?: (citation: AgentCitation) => void;
}) {
  const url = buildGitHubFileUrl(repository, citation.filePath, citation.lineRange);
  const vsCodeUrl = buildVsCodeUrl(repository, citation.filePath, citation.lineRange);

  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        onClick={() => onSelectCitation?.(citation)}
        className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/20 border border-primary/40 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-primary hover:bg-primary/30 transition-colors cursor-pointer"
      >
        [{index + 1}]
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-50">
        <span className="rounded bg-black/90 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-white/90 shadow-xl whitespace-nowrap flex items-center gap-2">
          <FileText className="h-3 w-3 text-primary shrink-0" />
          <span>{citation.filePath}</span>
          {citation.lineRange && (
            <span className="text-white/40">:{citation.lineRange}</span>
          )}
          {url && <ExternalLink className="h-2.5 w-2.5 text-white/40 pointer-events-auto hover:text-white" />}
          {vsCodeUrl && (
            <a
              href={vsCodeUrl}
              title="Open in VS Code"
              className="pointer-events-auto text-[10px] font-semibold text-sky-400 hover:text-sky-300 underline"
            >
              Open in VS Code
            </a>
          )}
        </span>
        <span className="border-x-4 border-x-transparent border-t-4 border-t-black/90" />
      </span>
    </span>
  );
}
