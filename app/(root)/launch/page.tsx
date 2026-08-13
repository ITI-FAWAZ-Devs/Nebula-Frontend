"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search, Plus, Database, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";
import { RepoCard } from "@/components/launch/RepoCard";
import { LaunchOverlay } from "@/components/launch/LaunchOverlay";
import { ImportRepoPicker } from "@/components/launch/ImportRepoPicker";
import { RepoDeleteConfirm } from "@/components/launch/RepoDeleteConfirm";
import { RepoDetailModal } from "@/components/launch/RepoDetailModal";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import { useImportedReposQuery, useDeleteRepoMutation, Repository } from "@/hooks/use-repository";
import { useWorkspaceStore } from "@/lib/store";
import { useArchDocStatusQuery, useRegenerateMutation } from "@/hooks/use-arch-doc";
import { Starfield } from "@/components/landing/Starfield";

export default function HangarPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { workspace } = useWorkspaceStore();
  const activeOrgId = workspace.type === "organization" ? workspace.organizationId : null;
  
  // UI states for modals/drawers
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailRepoId, setDetailRepoId] = useState<string | null>(null);
  const [deleteRepo, setDeleteRepo] = useState<Repository | null>(null);
  const [launching, setLaunching] = useState<Repository | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Queries & Mutations — scoped by workspace
  const { data: repos, isLoading, error, refetch } = useImportedReposQuery(activeOrgId);
  const { data: docStatus } = useArchDocStatusQuery();
  const deleteMutation = useDeleteRepoMutation();
  const regenerateMutation = useRegenerateMutation();

  const docStatusByRepo = (docStatus || []).reduce<Record<string, { hasDoc: boolean }>>(
    (acc, entry) => {
      acc[entry.repositoryId] = { hasDoc: entry.hasDoc };
      return acc;
    },
    {}
  );

  const handleLaunch = (r: Repository) => {
    setLaunching(r);
    setTimeout(() => {
      router.push(
        `/analysis?repoId=${r.id}&repo=${encodeURIComponent(`${r.owner}/${r.name}`)}`
      );
    }, 1400);
  };

  const handleOpenWorkspace = (r: Repository) => {
    router.push(
      `/workspace?repoId=${r.id}&repo=${encodeURIComponent(`${r.owner}/${r.name}`)}`
    );
  };

  const handleRegenerate = async (r: Repository) => {
    setRegeneratingId(r.id);
    try {
      const result = await regenerateMutation.mutateAsync(r.id);
      if (result.needsRegeneration) {
        router.push(
          `/workspace?repoId=${r.id}&repo=${encodeURIComponent(`${r.owner}/${r.name}`)}`
        );
      } else {
        toast.info("No new changes to regenerate");
      }
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
          (err as Error)?.message ||
          "Failed to regenerate"
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRepo) return;

    toast.promise(
      deleteMutation.mutateAsync(deleteRepo.id),
      {
        loading: `Removing ${deleteRepo.name}...`,
        success: () => {
          setDeleteRepo(null);
          return `Successfully disconnected ${deleteRepo.name}`;
        },
        error: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "Failed to delete repository.";
          return `Error: ${msg}`;
        }
      }
    );
  };

  // Filter local state list
  const filtered = (repos || []).filter(r => {
    const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase()) || 
                         r.owner.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="relative min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 overflow-hidden text-foreground">
      <NebulaBackdrop />

      <main className="relative z-10 mx-auto max-w-7xl px-2 pb-24">
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mt-6 mb-14"
        >
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight md:text-6xl text-white">
            Select a repository. <br />
            <span className="text-gradient">Prepare it for launch.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Every codebase becomes a living celestial body inside your Nebula. Pick a payload — we'll ignite the analysis engines and open the galaxy.
          </p>
        </motion.div>

        {/* Search and Filters panel bar */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="premium-panel mb-10 flex flex-wrap items-center gap-3 p-3"
        >
          <div className="flex flex-1 items-center gap-2 rounded-md bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              placeholder="Search imported repositories…"
              className="w-full bg-transparent font-mono text-sm placeholder:text-muted-foreground focus:outline-none text-white" 
            />
          </div>
          <Button 
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 h-9 font-mono text-xs text-muted-foreground hover:text-white cursor-pointer hover:bg-white/10"
          >
            <Plus className="h-3.5 w-3.5" /> Import repository
          </Button>
        </motion.div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-mono tracking-widest uppercase">Loading hangar payloads...</span>
          </div>
        )}

        {/* Error Alert Box */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center premium-panel border-rose-500/20 bg-rose-500/5 max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
            <p className="text-xs text-muted-foreground">
              {(error as any)?.response?.data?.message || error.message || "Failed to load database repositories."}
            </p>
            <Button variant="ghost" className="mt-3 text-xs text-primary cursor-pointer" onClick={() => refetch()}>
              Retry Fetch
            </Button>
          </div>
        )}

        {/* Repositories Cards Grid Layout */}
        {!isLoading && !error && (
          <>
            {filtered.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((repo, i) => (
                  <RepoCard 
                    key={repo.id} 
                    repo={repo} 
                    index={i} 
                    hasDoc={docStatusByRepo[repo.id]?.hasDoc}
                    isRegenerating={regeneratingId === repo.id}
                    onLaunch={handleLaunch} 
                    onOpenWorkspace={handleOpenWorkspace}
                    onRegenerate={handleRegenerate}
                    onDeleteClick={(r) => setDeleteRepo(r)}
                    onDetailClick={(r) => setDetailRepoId(r.id)}
                  />
                ))}
              </div>
            ) : (
              <Empty className="border-white/5 bg-white/[0.02] py-20 rounded-2xl">
                <EmptyHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/5 text-muted-foreground mb-4">
                    <Database className="h-6 w-6" />
                  </div>
                  <EmptyTitle className="text-white text-base">No Hangar Payloads</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground mt-1 max-w-sm">
                    {query 
                      ? `No repositories found matching "${query}" in this filter.` 
                      : "Your hangar control center is empty. Import codebases to ignite telemetry models."}
                  </EmptyDescription>
                </EmptyHeader>
                {!query && (
                  <EmptyContent>
                    <Button 
                      onClick={() => setSearchOpen(true)}
                      className="rounded-full font-mono text-xs uppercase tracking-widest text-white mt-3 cursor-pointer px-6"
                      style={{
                        background: "#4493F8",
                        boxShadow: "0 4px 16px -4px #4493F899",
                      }}
                    >
                      Import First Repository
                    </Button>
                  </EmptyContent>
                )}
              </Empty>
            )}
          </>
        )}
      </main>

      {/* Slide / Popup Dialog elements */}
      <ImportRepoPicker 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
      />

      <RepoDeleteConfirm 
        open={!!deleteRepo} 
        onOpenChange={(open) => !open && setDeleteRepo(null)} 
        repoName={deleteRepo?.name || ""} 
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />

      <RepoDetailModal 
        repoId={detailRepoId} 
        open={!!detailRepoId} 
        onOpenChange={(open) => !open && setDetailRepoId(null)} 
      />

      {/* Launch Overlay modal */}
      <LaunchOverlay launching={launching} />
    </div>
  );
}
