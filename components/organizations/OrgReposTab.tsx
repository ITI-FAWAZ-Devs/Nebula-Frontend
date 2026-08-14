"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, GitBranch, Lock, Globe, Database, Trash2 } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useOrgRepositoriesQuery } from "@/hooks/use-organization";
import { useDeleteRepoMutation } from "@/hooks/use-repository";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

interface OrgReposTabProps {
  orgId: string;
  canDelete?: boolean;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  IMPORTED: {
    label: "Imported",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  CLONING: {
    label: "Cloning",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  INDEXING: {
    label: "Indexing",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  FAILED: {
    label: "Failed",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export function OrgReposTab({ orgId, canDelete = false }: OrgReposTabProps) {
  const { data: repos, isLoading } = useOrgRepositoriesQuery(orgId);
  const deleteMutation = useDeleteRepoMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (repoId: string, repoName: string) => {
    setDeletingId(repoId);
    try {
      await deleteMutation.mutateAsync(repoId);
      toast.success(`Repository "${repoName}" removed`);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || "Failed to remove repository");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-white/50 animate-pulse font-mono text-xs">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Fetching organization repositories...
      </div>
    );
  }

  if (!repos || repos.length === 0) {
    return (
      <Empty className="border-white/5 bg-white/2 py-16 rounded-xl">
        <EmptyHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/5 text-muted-foreground mb-4">
            <Database className="h-6 w-6" />
          </div>
          <EmptyTitle className="text-white text-base">No Repositories</EmptyTitle>
          <EmptyDescription className="text-muted-foreground mt-1 max-w-sm">
            No repositories have been imported into this organization yet. Import a repository from the Launch Pad and select this organization as the scope.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-white">Organization Repositories</h3>
        <p className="text-xs text-white/40 font-mono mt-0.5">
          {repos.length} repositor{repos.length === 1 ? "y" : "ies"} scoped to this organization
        </p>
      </div>

      {/* Repos grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => {
          const statusStyle = STATUS_STYLES[repo.status] || STATUS_STYLES.IMPORTED;
          const isDeleting = deletingId === repo.id;
          return (
            <div
              key={repo.id}
              className="glass-panel p-5 space-y-3 flex flex-col justify-between border-white/5 hover:border-white/10 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/5">
                      <FiGithub className="h-4 w-4 text-white/70" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-white/40 truncate leading-none">
                        {repo.owner} /
                      </div>
                      <div className="text-sm font-semibold text-white truncate mt-0.5">
                        {repo.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono ${statusStyle.className}`}
                    >
                      {statusStyle.label}
                    </Badge>

                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                            className="h-7 w-7 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#0f0f0f] border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Remove repository?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/50">
                              This will remove <span className="text-white font-semibold">{repo.owner}/{repo.name}</span> from this organization. Indexed data will be lost.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(repo.id, repo.name)}
                              className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 font-mono text-[9px] text-white/40 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                    <GitBranch className="h-3 w-3 text-white/50" /> {repo.defaultBranch}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                      repo.isPrivate
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {repo.isPrivate ? (
                      <><Lock className="h-2.5 w-2.5" /> Private</>
                    ) : (
                      <><Globe className="h-2.5 w-2.5" /> Public</>
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-white/30">
                Imported {new Date(repo.createdAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
