"use client";

import { toast } from "sonner";
import { 
  GitBranch, 
  Globe, 
  Lock, 
  Loader2, 
  Calendar, 
  Copy, 
  Check, 
  Terminal, 
  Database,
  ArrowUpRight 
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositoryQuery } from "@/hooks/use-repository";

interface RepoDetailModalProps {
  repoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepoDetailModal({ repoId, open, onOpenChange }: RepoDetailModalProps) {
  const { data: repo, isLoading, error } = useRepositoryQuery(repoId);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Clone URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "border-emerald-500/25 bg-emerald-500/5 text-emerald-400";
      case "FAILED":
        return "border-rose-500/25 bg-rose-500/5 text-rose-400";
      case "CLONING":
      case "INDEXING":
        return "border-primary/25 bg-primary/5 text-primary";
      default:
        return "border-white/10 bg-white/5 text-muted-foreground";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="premium-panel w-full sm:max-w-md border-l border-white/10 bg-background/95 backdrop-blur-xl text-white p-6">
        <SheetHeader className="p-0 mb-6">
          <SheetTitle className="text-white text-lg font-display font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Repository Payload Detail
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Detailed configurations and indexing logs for this payload.
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3 bg-white/5" />
              <Skeleton className="h-7 w-2/3 bg-white/5" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                  <Skeleton className="h-4 w-1/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-rose-500">Failed to load repository configurations.</p>
          </div>
        )}

        {repo && !isLoading && (
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 scrollbar-thin">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <FiGithub className="h-3.5 w-3.5" />
                {repo.owner} /
              </div>
              <h3 className="font-display text-2xl font-semibold mt-1 tracking-tight truncate">
                {repo.name}
              </h3>
            </div>

            {/* Config metadata fields list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-muted-foreground">Cockpit Status</span>
                <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${getStatusColor(repo.status)}`}>
                  {(repo.status === "CLONING" || repo.status === "INDEXING") && (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  )}
                  {repo.status}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-muted-foreground">Visibility</span>
                <Badge variant="outline" className="h-5 text-[9px] border-white/10 rounded-full font-mono uppercase text-muted-foreground">
                  {repo.isPrivate ? (
                    <>
                      <Lock className="mr-1 h-2.5 w-2.5" /> Private
                    </>
                  ) : (
                    <>
                      <Globe className="mr-1 h-2.5 w-2.5" /> Public
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-muted-foreground">Default Branch</span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white bg-white/5 border border-white/5 px-2.5 py-0.5 rounded">
                  <GitBranch className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" /> {repo.defaultBranch}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-muted-foreground">Imported Date</span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-white">
                  <Calendar className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                  {new Date(repo.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {repo.localPath && (
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-xs text-muted-foreground">Local Storage Path</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-white max-w-[200px] truncate">
                    <Terminal className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                    {repo.localPath}
                  </span>
                </div>
              )}
            </div>

            {/* Clone URL Box */}
            <div className="space-y-2">
              <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Clone URL</label>
              <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/5 p-2 font-mono text-[11px]">
                <span className="flex-1 truncate text-white/70 select-all">{repo.cloneUrl}</span>
                <Button 
                  size="icon-xs" 
                  variant="ghost" 
                  onClick={() => handleCopy(repo.cloneUrl)}
                  className="h-7 w-7 text-muted-foreground hover:text-white"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {/* Launch Action */}
            <Button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-primary/15 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-white transition-all hover:border-primary/40 hover:shadow-[0_0_30px_#4493F840] cursor-pointer"
              onClick={() => {
                window.open(`https://github.com/${repo.owner}/${repo.name}`, "_blank");
              }}
            >
              View on GitHub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
