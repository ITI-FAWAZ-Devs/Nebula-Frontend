"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Lock, Globe, Loader2, AlertCircle } from "lucide-react";
import { FiGithub } from "react-icons/fi";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGithubReposQuery, useImportRepoMutation, GitHubRepoDetails } from "@/hooks/use-repository";

interface ImportRepoPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportRepoPicker({ open, onOpenChange }: ImportRepoPickerProps) {
  const { data, isLoading, error, refetch } = useGithubReposQuery();
  const importMutation = useImportRepoMutation();
  const [importingId, setImportingId] = useState<string | null>(null);

  const handleImport = async (repo: GitHubRepoDetails) => {
    setImportingId(repo.githubRepoId);
    
    // Create direct promise toast for a premium, clean user feedback loop
    toast.promise(
      importMutation.mutateAsync(repo),
      {
        loading: `Importing ${repo.owner}/${repo.name}...`,
        success: () => {
          setImportingId(null);
          onOpenChange(false);
          return `Successfully imported ${repo.name}!`;
        },
        error: (err: any) => {
          setImportingId(null);
          const msg = err?.response?.data?.message || err?.message || "Failed to import repository.";
          return `Failed: ${msg}`;
        }
      }
    );
  };

  const isGitHubLinked = !error || (error as any)?.response?.status !== 400;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Import Repository"
      description="Select a GitHub repository to sync with your Nebula cockpit."
      className="premium-panel max-w-2xl! border-white/10 bg-background/95 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(168,85,247,0.2)]"
    >
      <CommandInput placeholder="Search GitHub repositories..." className="text-white placeholder:text-white/20 font-mono text-xs" />

      <CommandList className="no-scrollbar p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground animate-pulse">
            <div className="relative flex items-center justify-center">
              <div className="h-11 w-11 rounded-full border-2 border-t-nebula-cyan border-white/10 animate-spin" />
              <Loader2 className="absolute h-4.5 w-4.5 text-nebula-purple animate-pulse" />
            </div>
            <div className="text-center">
              <span className="text-xs font-mono tracking-widest uppercase text-white/70">Ingesting Telemetry...</span>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">Connecting secure downlink stream</p>
            </div>
          </div>
        )}

        {!isGitHubLinked && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-white/5 bg-white/[0.02] rounded-xl my-2">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/5 mb-4">
              <div className="absolute inset-0 rounded-full border border-dashed border-nebula-purple/30 animate-spin-slow" />
              <FiGithub className="h-7 w-7 text-white/80" />
            </div>
            <h3 className="font-display text-sm font-semibold text-white">GitHub Account Offline</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">
              Authentication is required to query active payloads. Grant read permissions to import codebases.
            </p>
            <Button
              className="mt-6 rounded-full px-7 h-10 font-mono text-xs uppercase tracking-widest text-primary-foreground cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_20px_oklch(0.72_0.18_265/0.5)]"
              style={{
                background: "linear-gradient(135deg, oklch(0.82 0.14 210), oklch(0.72 0.18 265))",
              }}
              onClick={() => {
                window.location.href = `${apiBaseUrl}/auth/github`;
              }}
            >
              <FiGithub className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
          </div>
        )}

        {error && isGitHubLinked && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-rose-500/10 bg-rose-500/[0.02] rounded-xl my-2">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-xs text-muted-foreground max-w-xs">
              {(error as any)?.response?.data?.message || error.message || "Failed to load repositories from GitHub."}
            </p>
            <Button variant="ghost" className="mt-3 text-xs text-nebula-cyan border border-white/5 cursor-pointer" onClick={() => refetch()}>
              Retry Uplink
            </Button>
          </div>
        )}

        <CommandEmpty className="text-muted-foreground text-xs py-12 text-center font-mono">
          No payloads match search query.
        </CommandEmpty>

        {data?.repositories && data.repositories.length > 0 && (
          <CommandGroup heading={`Available Payloads (${data.repositories.length})`} className="text-white/30 font-mono text-[10px] uppercase tracking-wider mt-2">
            {data.repositories.map((repo) => {
              const isImporting = importingId === repo.githubRepoId;
              return (
                <CommandItem
                  key={repo.githubRepoId}
                  value={`${repo.owner}/${repo.name}`}
                  onSelect={() => !isImporting && handleImport(repo)}
                  className="group/item flex items-center justify-between py-3.5 px-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 hover:translate-x-1 duration-200 transition-all cursor-pointer data-selected:bg-white/5 data-selected:border-white/10 data-selected:translate-x-1 mb-2.5 last:mb-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/5 group-hover/item:border-nebula-cyan/20 group-hover/item:bg-white/10 transition-colors">
                      <FiGithub className="h-4.5 w-4.5 text-white/70 group-hover/item:text-white transition-colors" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-mono text-[10px] text-white/40 truncate leading-none">
                        {repo.owner} /
                      </div>
                      <div className="font-display text-sm font-medium text-white truncate mt-1">
                        {repo.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/40 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                      <GitBranch className="h-3 w-3 text-white/50" /> {repo.defaultBranch}
                    </span>
                    
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono border uppercase ${
                      repo.isPrivate 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${repo.isPrivate ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                      {repo.isPrivate ? 'Private' : 'Public'}
                    </span>

                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-nebula-cyan" />
                    ) : (
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                        <span className="text-[10px] font-mono text-nebula-cyan uppercase tracking-wider flex items-center gap-1">
                          Import <span className="translate-x-0 group-hover/item:translate-x-0.5 transition-transform">→</span>
                        </span>
                      </div>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
