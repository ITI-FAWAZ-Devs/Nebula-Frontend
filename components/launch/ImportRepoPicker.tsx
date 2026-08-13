"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Loader2, AlertCircle, Globe, Link2, ChevronDown } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { Building2, UserCircle2 } from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGithubReposQuery,
  useImportRepoMutation,
  useImportRepoFromUrlMutation,
  GitHubRepoDetails,
} from "@/hooks/use-repository";
import {
  useUserConnectionsQuery,
  useOrgConnectionsQuery,
  GitHubConnection,
} from "@/hooks/use-organization";
import { useWorkspaceStore } from "@/lib/store";
import { ConnectGithubButton } from "@/components/integrations/ConnectGithubButton";
import { cn } from "@/lib/utils";

interface ImportRepoPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportRepoPicker({ open, onOpenChange }: ImportRepoPickerProps) {
  const { workspace } = useWorkspaceStore();
  const activeOrgId = workspace.type === "organization" ? workspace.organizationId : null;

  // Load connections based on workspace context
  const { data: userConns } = useUserConnectionsQuery();
  const { data: orgConns } = useOrgConnectionsQuery(activeOrgId);
  const connections: GitHubConnection[] = (activeOrgId ? orgConns : userConns) ?? [];

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGithubReposQuery({
    connectionId: selectedConnectionId ?? undefined,
  });

  const importMutation = useImportRepoMutation();
  const importUrlMutation = useImportRepoFromUrlMutation();

  const [importMode, setImportMode] = useState<"list" | "url">("list");
  const [urlInput, setUrlInput] = useState("");
  const [importingId, setImportingId] = useState<string | null>(null);

  const hasConnections = connections.length > 0;

  const handleImport = async (repo: GitHubRepoDetails) => {
    setImportingId(repo.githubRepoId);

    const payload: any = {
      ...repo,
      ...(activeOrgId ? { organizationId: activeOrgId } : {}),
      ...(selectedConnectionId ? { connectionId: selectedConnectionId } : {}),
    };

    toast.promise(importMutation.mutateAsync(payload), {
      loading: `Importing ${repo.owner}/${repo.name}...`,
      success: () => {
        setImportingId(null);
        onOpenChange(false);
        return `Successfully imported ${repo.name}!`;
      },
      error: (err: any) => {
        setImportingId(null);
        const status = err?.response?.status;
        if (status === 428) {
          return "GitHub connection required. Please connect a GitHub account first.";
        }
        return err?.response?.data?.message || err?.message || "Failed to import repository.";
      },
    });
  };

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImportingId("url-import");
    toast.promise(
      importUrlMutation.mutateAsync({
        url: urlInput.trim(),
        ...(activeOrgId ? { organizationId: activeOrgId } : {}),
        ...(selectedConnectionId ? { connectionId: selectedConnectionId } : {}),
      }),
      {
        loading: "Importing repository from URL...",
        success: (res) => {
          setImportingId(null);
          setUrlInput("");
          onOpenChange(false);
          return `Successfully imported ${res.owner}/${res.name}!`;
        },
        error: (err: any) => {
          setImportingId(null);
          return err?.response?.data?.message || err?.message || "Failed to import from URL.";
        },
      },
    );
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Import Repository"
      description="Select a GitHub repository or paste a URL to sync with Nebula."
      className="premium-panel max-w-2xl! border-white/10 bg-background/95 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(168,85,247,0.2)] text-white"
    >
      {/* Header: mode + connection selector */}
      <div className="flex flex-col gap-2 p-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Import mode tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setImportMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer",
                importMode === "list" ? "bg-primary text-white font-semibold shadow-sm" : "text-white/50 hover:text-white",
              )}
            >
              <FiGithub className="h-3.5 w-3.5" /> GitHub Repos
            </button>
            <button
              type="button"
              onClick={() => setImportMode("url")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer",
                importMode === "url" ? "bg-primary text-white font-semibold shadow-sm" : "text-white/50 hover:text-white",
              )}
            >
              <Link2 className="h-3.5 w-3.5" /> URL
            </button>
          </div>

          {/* GitHub account / connection selector */}
          {hasConnections && importMode === "list" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedConnectionId(null)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all",
                  selectedConnectionId === null
                    ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                    : "bg-white/5 text-white/50 border-white/5 hover:text-white",
                )}
              >
                All
              </button>
              {connections.filter((c) => c.providerAccountType !== "ORGANIZATION").length > 0 && (
                <>
                  <span className="text-[9px] font-mono text-white/25 uppercase mx-1">Personal</span>
                  {connections.filter((c) => c.providerAccountType !== "ORGANIZATION").map((conn) => (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => setSelectedConnectionId(conn.id)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all",
                        selectedConnectionId === conn.id
                          ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                          : "bg-white/5 text-white/50 border-white/5 hover:text-white",
                      )}
                    >
                      <UserCircle2 className="h-3 w-3 text-blue-400" />
                      {conn.providerAccountLogin ?? conn.label ?? "GitHub"}
                    </button>
                  ))}
                </>
              )}
              {connections.filter((c) => c.providerAccountType === "ORGANIZATION").length > 0 && (
                <>
                  <span className="text-[9px] font-mono text-white/25 uppercase mx-1">Orgs</span>
                  {connections.filter((c) => c.providerAccountType === "ORGANIZATION").map((conn) => (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => setSelectedConnectionId(conn.id)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all",
                        selectedConnectionId === conn.id
                          ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                          : "bg-white/5 text-white/50 border-white/5 hover:text-white",
                      )}
                    >
                      <Building2 className="h-3 w-3 text-purple-400" />
                      {conn.providerAccountLogin ?? conn.label ?? "GitHub"}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {importMode === "url" ? (
        <form onSubmit={handleUrlImport} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/70 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" /> Repository URL or Shorthand
            </label>
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://github.com/facebook/react or facebook/react"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono text-xs h-10"
              />
              <Button
                type="submit"
                disabled={!urlInput.trim() || importingId === "url-import"}
                className="h-10 px-5 text-xs font-mono rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
              >
                {importingId === "url-import" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
              </Button>
            </div>
            <p className="text-[11px] text-white/40 font-mono">
              Public repos require no token. Private repos use your saved connection.
            </p>
          </div>
        </form>
      ) : (
        <>
          <CommandInput
            placeholder="Search GitHub repositories..."
            className="text-white placeholder:text-white/20 font-mono text-xs"
          />
          <CommandList className="no-scrollbar p-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground animate-pulse">
                <div className="relative flex items-center justify-center">
                  <div className="h-11 w-11 rounded-full border-2 border-t-primary border-white/10 animate-spin" />
                  <Loader2 className="absolute h-4.5 w-4.5 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-mono tracking-widest uppercase text-white/70">Loading repositories...</span>
                </div>
              </div>
            )}

            {/* No connection: prompt to connect GitHub */}
            {!hasConnections && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-white/5 bg-white/[0.02] rounded-xl my-2">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/5 mb-4">
                  <FiGithub className="h-7 w-7 text-white/80" />
                </div>
                <h3 className="font-display text-sm font-semibold text-white">No GitHub account linked</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">
                  Connect a GitHub account to browse and import repositories.
                </p>
                <div className="mt-6">
                  <ConnectGithubButton
                    organizationId={activeOrgId}
                    returnTo="/launch"
                    className="rounded-xl px-6 h-10 font-mono text-xs text-white bg-primary hover:bg-primary/90"
                  />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && hasConnections && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-rose-500/10 bg-rose-500/[0.02] rounded-xl my-2">
                <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
                <p className="text-xs text-muted-foreground max-w-xs">
                  {(error as any)?.response?.data?.message || (error as Error).message || "Failed to load repositories."}
                </p>
                <Button variant="ghost" className="mt-3 text-xs text-primary border border-white/5 cursor-pointer" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            )}

            <CommandEmpty className="text-muted-foreground text-xs py-12 text-center font-mono">
              No repositories match search query.
            </CommandEmpty>

            {data?.repositories && data.repositories.length > 0 && (
              <CommandGroup
                heading={`Repositories (${data.repositories.length})`}
                className="text-white/30 font-mono text-[10px] uppercase tracking-wider mt-2"
              >
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
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/5 group-hover/item:border-primary/20 group-hover/item:bg-white/10 transition-colors">
                          <FiGithub className="h-4.5 w-4.5 text-white/70 group-hover/item:text-white transition-colors" />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="font-mono text-[10px] text-white/40 truncate leading-none">{repo.owner} /</div>
                          <div className="font-display text-sm font-medium text-white truncate mt-1">{repo.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/40 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                          <GitBranch className="h-3 w-3 text-white/50" /> {repo.defaultBranch}
                        </span>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono border uppercase",
                          repo.isPrivate
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", repo.isPrivate ? "bg-purple-400" : "bg-emerald-400")} />
                          {repo.isPrivate ? "Private" : "Public"}
                        </span>
                        {isImporting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                            <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Import →</span>
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </>
      )}
    </CommandDialog>
  );
}
