"use client";

import Link from "next/link";
import {
  Hexagon,
  GitCommit,
  Shield,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchDocVersionSummary } from "@/hooks/use-arch-doc";
import { timeAgo } from "./wiki-helpers";


interface ArchitectureWikiHeaderProps {
  shortSha: string;
  verificationScore: number | null;
  generatedAt?: string | null;
  versions: ArchDocVersionSummary[];
  activeVersion: ArchDocVersionSummary | null;
  selectedVersion: number;
  latestVersion: number;
  onVersionChange: (version: number) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  canRegenerate?: boolean;
}

export function ArchitectureWikiHeader({
  shortSha,
  verificationScore,
  generatedAt,
  versions,
  activeVersion,
  selectedVersion,
  latestVersion,
  onVersionChange,
  onRegenerate,
  isRegenerating,
  canRegenerate = true,
}: ArchitectureWikiHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-background/70 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="font-display text-lg font-semibold text-white">
            Nebula
          </Link>
        </div>
        <span className="h-4 w-px bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Architecture Wiki
        </span>
        <span className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
          <GitCommit className="h-3 w-3" />
          <span className="text-primary/70">{shortSha}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Verified</span>
          <span className="text-white/20">·</span>
          {/* <span>score {verificationScore ?? 0}</span> */}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{generatedAt ? timeAgo(generatedAt) : "—"}</span>
        </div>
        <Select
          value={selectedVersion.toString()}
          onValueChange={(value) => value && onVersionChange(Number(value))}
        >
          <SelectTrigger className="h-7 border-white/10 bg-white/5 px-2.5 font-mono text-[10px] uppercase tracking-wider text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-panel border-white/10 bg-popover/95 font-mono text-white">
            {isRegenerating && activeVersion && (
              <SelectItem
                key={`active-${activeVersion.version}`}
                value={`active-${activeVersion.version}`}
                disabled
                className="text-muted-foreground"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Regenerating v{activeVersion.version}…
                </span>
              </SelectItem>
            )}
            {versions.map((v) => (
              <SelectItem
                key={v.version}
                value={v.version.toString()}
                className="text-[10px] uppercase tracking-wider"
              >
                {v.version === latestVersion ? "Latest" : `v${v.version}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isRegenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </button>
        )}
      </div>
    </header>
  );
}
