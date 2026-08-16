"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Loader2, AlertCircle, Globe, Link2 } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { Building2, UserCircle2 } from "lucide-react";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const { data: userConns } = useUserConnectionsQuery();
  const { data: orgConns } = useOrgConnectionsQuery(activeOrgId);
  const connections: GitHubConnection[] = (activeOrgId ? orgConns : userConns) ?? [];

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGithubReposQuery({
    connectionId: selectedConnectionId ?? undefined,
    organizationId: activeOrgId,
    enabled: open,
  });

  const importMutation = useImportRepoMutation();
  const importUrlMutation = useImportRepoFromUrlMutation();

  const [importMode, setImportMode] = useState<"list" | "url">("list");
  const [urlInput, setUrlInput] = useState("");
  const [importingId, setImportingId] = useState<string | null>(null);

  const hasConnections = connections.length > 0;
  const personalConnections = connections.filter((c) => c.providerAccountType !== "ORGANIZATION");
  const orgConnections = connections.filter((c) => c.providerAccountType === "ORGANIZATION");

  const handleImport = async (repo: GitHubRepoDetails) => {
    setImportingId(repo.githubRepoId);

    const payload: GitHubRepoDetails & { organizationId?: string; connectionId?: string } = {
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
      error: (err: { response?: { status?: number; data?: { message?: string } }; message?: string }) => {
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
        error: (err: { response?: { data?: { message?: string } }; message?: string }) => {
          setImportingId(null);
          return err?.response?.data?.message || err?.message || "Failed to import from URL.";
        },
      },
    );
  };

  const stopCmdk = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="premium-panel top-1/3 max-w-2xl! translate-y-0 overflow-hidden rounded-xl! border-white/10 bg-background/95 p-0 text-white shadow-[0_0_60px_-10px_rgba(168,85,247,0.2)] backdrop-blur-xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Import Repository</DialogTitle>
          <DialogDescription>
            Select a GitHub repository or paste a URL to sync with Nebula.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-2 border-b border-white/5 bg-white/[0.02] p-3"
          onPointerDown={stopCmdk}
          onClick={stopCmdk}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setImportMode("list")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs transition-all",
                  importMode === "list" ? "bg-primary font-semibold text-white shadow-sm" : "text-white/50 hover:text-white",
                )}
              >
                <FiGithub className="h-3.5 w-3.5" /> GitHub Repos
              </button>
              <button
                type="button"
                onClick={() => setImportMode("url")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs transition-all",
                  importMode === "url" ? "bg-primary font-semibold text-white shadow-sm" : "text-white/50 hover:text-white",
                )}
              >
                <Link2 className="h-3.5 w-3.5" /> URL
              </button>
            </div>

            {hasConnections && importMode === "list" && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onPointerDown={stopCmdk}
                  onClick={() => setSelectedConnectionId(null)}
                  className={cn(
                    "flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] transition-all",
                    selectedConnectionId === null
                      ? "border-primary/40 bg-primary/20 font-semibold text-primary"
                      : "border-white/5 bg-white/5 text-white/50 hover:text-white",
                  )}
                >
                  All
                </button>
                {personalConnections.length > 0 && (
                  <>
                    <span className="mx-1 font-mono text-[9px] text-white/25 uppercase">Personal</span>
                    {personalConnections.map((conn) => (
                      <button
                        key={conn.id}
                        type="button"
                        onPointerDown={stopCmdk}
                        onClick={() => setSelectedConnectionId(conn.id)}
                        className={cn(
                          "flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] transition-all",
                          selectedConnectionId === conn.id
                            ? "border-primary/40 bg-primary/20 font-semibold text-primary"
                            : "border-white/5 bg-white/5 text-white/50 hover:text-white",
                        )}
                      >
                        <UserCircle2 className="h-3 w-3 text-blue-400" />
                        {conn.providerAccountLogin ?? conn.label ?? "GitHub"}
                      </button>
                    ))}
                  </>
                )}
                {orgConnections.length > 0 && (
                  <>
                    <span className="mx-1 font-mono text-[9px] text-white/25 uppercase">Orgs</span>
                    {orgConnections.map((conn) => (
                      <button
                        key={conn.id}
                        type="button"
                        onPointerDown={stopCmdk}
                        onClick={() => setSelectedConnectionId(conn.id)}
                        className={cn(
                          "flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] transition-all",
                          selectedConnectionId === conn.id
                            ? "border-primary/40 bg-primary/20 font-semibold text-primary"
                            : "border-white/5 bg-white/5 text-white/50 hover:text-white",
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
          <form onSubmit={handleUrlImport} className="space-y-4 p-6" onPointerDown={stopCmdk}>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 font-mono text-xs text-white/70">
                <Globe className="h-3.5 w-3.5 text-primary" /> Repository URL or Shorthand
              </label>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://github.com/facebook/react or facebook/react"
                  className="h-10 border-white/10 bg-white/5 font-mono text-xs text-white placeholder:text-white/30"
                />
                <Button
                  type="submit"
                  disabled={!urlInput.trim() || importingId === "url-import"}
                  className="h-10 shrink-0 cursor-pointer rounded-lg bg-primary px-5 font-mono text-xs text-white hover:bg-primary/90"
                >
                  {importingId === "url-import" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
                </Button>
              </div>
              <p className="font-mono text-[11px] text-white/40">
                Public repos require no token. Private repos use your saved connection.
              </p>
            </div>
          </form>
        ) : (
          <Command className="rounded-none bg-transparent p-0 text-white">
            <CommandInput
              placeholder="Search GitHub repositories..."
              className="font-mono text-xs text-white placeholder:text-white/20"
            />
            <CommandList className="no-scrollbar p-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground animate-pulse">
                  <div className="relative flex items-center justify-center">
                    <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                    <Loader2 className="absolute h-4.5 w-4.5 animate-pulse text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-xs tracking-widest text-white/70 uppercase">
                      Loading repositories...
                    </span>
                  </div>
                </div>
              )}

              {!hasConnections && !isLoading && (
                <div className="my-2 flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center">
                  <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/5 bg-white/5">
                    <FiGithub className="h-7 w-7 text-white/80" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white">No GitHub account linked</h3>
                  <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    Connect a GitHub account to browse and import repositories.
                  </p>
                  <div className="mt-6" onPointerDown={stopCmdk} onClick={stopCmdk}>
                    <ConnectGithubButton
                      organizationId={activeOrgId}
                      returnTo="/launch?import=1"
                      className="h-10 rounded-xl bg-primary px-6 font-mono text-xs text-white hover:bg-primary/90"
                    />
                  </div>
                </div>
              )}

              {error && !isLoading && hasConnections && (
                <div className="my-2 flex flex-col items-center justify-center rounded-xl border border-rose-500/10 bg-rose-500/[0.02] px-6 py-12 text-center">
                  <AlertCircle className="mb-2 h-8 w-8 text-rose-500" />
                  <p className="max-w-xs text-xs text-muted-foreground">
                    {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                      (error as Error).message ||
                      "Failed to load repositories."}
                  </p>
                  <div className="mt-4 flex flex-col items-center gap-2" onPointerDown={stopCmdk} onClick={stopCmdk}>
                    <ConnectGithubButton
                      organizationId={activeOrgId}
                      label="Reconnect GitHub"
                      returnTo="/launch?import=1"
                      className="h-10 rounded-xl bg-primary px-6 font-mono text-xs text-white hover:bg-primary/90"
                    />
                    <Button
                      variant="ghost"
                      className="cursor-pointer border border-white/5 text-xs text-primary"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {!error && !isLoading && (
                <CommandEmpty className="py-12 text-center font-mono text-xs text-muted-foreground">
                  No repositories match search query.
                </CommandEmpty>
              )}

              {data?.repositories && data.repositories.length > 0 && (
                <CommandGroup
                  heading={`Repositories (${data.repositories.length})`}
                  className="mt-2 font-mono text-[10px] tracking-wider text-white/30 uppercase"
                >
                  {data.repositories.map((repo) => {
                    const isImporting = importingId === repo.githubRepoId;
                    return (
                      <CommandItem
                        key={repo.githubRepoId}
                        value={`${repo.owner}/${repo.name}`}
                        onSelect={() => !isImporting && handleImport(repo)}
                        className="group/item mb-2.5 flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 transition-all duration-200 last:mb-0 hover:translate-x-1 hover:border-white/10 hover:bg-white/[0.03] data-selected:translate-x-1 data-selected:border-white/10 data-selected:bg-white/5"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 transition-colors group-hover/item:border-primary/20 group-hover/item:bg-white/10">
                            <FiGithub className="h-4.5 w-4.5 text-white/70 transition-colors group-hover/item:text-white" />
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="truncate font-mono text-[10px] leading-none text-white/40">{repo.owner} /</div>
                            <div className="font-display mt-1 truncate text-sm font-medium text-white">{repo.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 rounded-md border border-white/5 bg-white/5 px-2 py-0.5 font-mono text-[9px] tracking-widest text-white/40 uppercase">
                            <GitBranch className="h-3 w-3 text-white/50" /> {repo.defaultBranch}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase",
                              repo.isPrivate
                                ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", repo.isPrivate ? "bg-purple-400" : "bg-emerald-400")} />
                            {repo.isPrivate ? "Private" : "Public"}
                          </span>
                          {isImporting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <div className="opacity-0 transition-opacity duration-200 group-hover/item:opacity-100">
                              <span className="font-mono text-[10px] tracking-wider text-primary uppercase">Import →</span>
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </DialogContent>
    </Dialog>
  );
}
