"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Search,
  Plus,
  Database,
  AlertCircle,
  Loader2,
  ListFilter,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";
import { RepoTable, matchesStatusFilter, type StatusFilter } from "@/components/launch/RepoTable";
import { LaunchOverlay } from "@/components/launch/LaunchOverlay";
import { RepoDeleteConfirm } from "@/components/launch/RepoDeleteConfirm";
import { RepoDetailModal } from "@/components/launch/RepoDetailModal";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useImportedReposQuery,
  useDeleteRepoMutation,
  Repository,
} from "@/hooks/use-repository";
import { useUiStore, useWorkspaceStore, useAuthStore } from "@/lib/store";
import { useOrganizationsQuery } from "@/hooks/use-organization";
import { useArchDocStatusQuery, useRegenerateMutation } from "@/hooks/use-arch-doc";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "indexed", label: "Indexed" },
  { id: "indexing", label: "Indexing" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const READ_ONLY_ROLE_NAMES = ["Viewer", "Developer"];
const VIEWER_ROLE_NAMES = ["Viewer"];

export default function HangarPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { workspace } = useWorkspaceStore();
  const activeOrgId = workspace.type === "organization" ? workspace.organizationId : null;
  const user = useAuthStore((s) => s.user);
  const { data: orgs } = useOrganizationsQuery();

  // Derive role-based permissions when in an org workspace
  const currentOrg = activeOrgId ? orgs?.find((o) => o.id === activeOrgId) : null;
  const isOwner = !!user && !!currentOrg && currentOrg.ownerId === user.id;
  const roleName = currentOrg?.userRole?.name ?? "";
  const myPermissions = currentOrg?.userRole?.permissions ?? [];
  const isRestrictedRole = !!activeOrgId && !isOwner && READ_ONLY_ROLE_NAMES.includes(roleName);
  const isViewerOnly = !!activeOrgId && !isOwner && VIEWER_ROLE_NAMES.includes(roleName);

  // Permission flags
  // Viewer + Developer: can never import or delete repos — role-name gated, not permission-gated
  const canImport = !isRestrictedRole;
  const canDelete = !isRestrictedRole;
  // Only Viewers cannot launch/regenerate docs
  const canLaunch = !isViewerOnly;
  const canRegenerate = !isViewerOnly;

  const setImportPickerOpen = useUiStore((s) => s.setImportPickerOpen);
  const [detailRepoId, setDetailRepoId] = useState<string | null>(null);
  const [deleteRepo, setDeleteRepo] = useState<Repository | null>(null);
  const [launching, setLaunching] = useState<Repository | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("import") !== "1") return;
    setImportPickerOpen(true);
    window.history.replaceState({}, "", "/launch");
  }, [setImportPickerOpen]);

  const { data: repos, isLoading, error, refetch } = useImportedReposQuery(activeOrgId);
  const { data: docStatus } = useArchDocStatusQuery();
  const deleteMutation = useDeleteRepoMutation();
  const regenerateMutation = useRegenerateMutation();

  const docStatusByRepo = useMemo(
    () =>
      (docStatus || []).reduce<Record<string, { hasDoc: boolean; version: number | null }>>(
        (acc, entry) => {
          acc[entry.repositoryId] = {
            hasDoc: entry.hasDoc,
            version: entry.version,
          };
          return acc;
        },
        {}
      ),
    [docStatus]
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

  const handleOpen = (r: Repository) => {
    if (docStatusByRepo[r.id]?.hasDoc) {
      handleOpenWorkspace(r);
    } else {
      handleLaunch(r);
    }
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

    toast.promise(deleteMutation.mutateAsync(deleteRepo.id), {
      loading: `Removing ${deleteRepo.name}...`,
      success: () => {
        setDeleteRepo(null);
        return `Successfully disconnected ${deleteRepo.name}`;
      },
      error: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response
            ?.data?.message ||
          (err as Error)?.message ||
          "Failed to delete repository.";
        return `Error: ${msg}`;
      },
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (repos || []).filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q);
      return matchesQuery && matchesStatusFilter(r, statusFilter);
    });
  }, [repos, query, statusFilter]);

  const totalCount = repos?.length ?? 0;
  const activeFilterLabel =
    STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? "All";

  return (
    <div className="relative min-h-screen bg-background pt-10 pb-16 px-4 sm:px-6 overflow-hidden text-foreground md:pt-8">
      <NebulaBackdrop />

      <main className="relative z-10 mx-auto max-w-7xl px-2 pb-16">
        <section>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Repositories
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                All repositories you&apos;ve connected to Nebula.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex-none sm:w-64">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer">
                  <ListFilter className="h-3.5 w-3.5" />
                  {activeFilterLabel}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 glass-panel border border-white/10 bg-popover/90 backdrop-blur p-1 text-white"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <DropdownMenuItem
                      key={filter.id}
                      className={cn(
                        "cursor-pointer rounded-md text-xs",
                        statusFilter === filter.id && "bg-white/10 text-white"
                      )}
                      onClick={() => setStatusFilter(filter.id)}
                    >
                      {filter.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {canImport && (
                <Button
                  onClick={() => setImportPickerOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-medium text-black hover:bg-white/90 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Import repository
                </Button>
              )}
            </div>
          </motion.div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-mono tracking-widest uppercase">
                Loading repositories...
              </span>
            </div>
          )}

          {error && !isLoading && (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center border-rose-500/20 bg-rose-500/5 px-6 py-16 text-center premium-panel">
              <AlertCircle className="mb-3 h-10 w-10 text-rose-500" />
              <p className="text-xs text-muted-foreground">
                {(error as { response?: { data?: { message?: string } } })?.response?.data
                  ?.message ||
                  error.message ||
                  "Failed to load repositories."}
              </p>
              <Button
                variant="ghost"
                className="mt-3 cursor-pointer text-xs text-primary"
                onClick={() => refetch()}
              >
                Retry Fetch
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {filtered.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                >
                  <RepoTable
                    repos={filtered}
                    docStatusByRepo={docStatusByRepo}
                    regeneratingId={regeneratingId}
                    onOpen={handleOpen}
                    onDetailClick={(r) => setDetailRepoId(r.id)}
                    onRegenerate={handleRegenerate}
                    onDeleteClick={(r) => setDeleteRepo(r)}
                    canImport={canImport}
                    canDelete={canDelete}
                    canLaunch={canLaunch}
                    canRegenerate={canRegenerate}
                  />
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Showing {filtered.length} of {totalCount} repositories.
                  </p>
                </motion.div>
              ) : (
                <Empty className="rounded-2xl border-white/5 bg-white/[0.02] py-20">
                  <EmptyHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/5 text-muted-foreground">
                      <Database className="h-6 w-6" />
                    </div>
                    <EmptyTitle className="text-base text-white">No repositories</EmptyTitle>
                    <EmptyDescription className="mt-1 max-w-sm text-muted-foreground">
                      {query || statusFilter !== "all"
                        ? "No repositories match your search or filter."
                        : "Connect a codebase to start indexing and drafting architecture docs."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!query && statusFilter === "all" && canImport && (
                    <EmptyContent>
                      <Button
                        onClick={() => setImportPickerOpen(true)}
                        className="mt-3 cursor-pointer rounded-full px-6 font-mono text-xs uppercase tracking-widest text-white"
                        style={{
                          background: "#4493F8",
                          boxShadow: "0 4px 16px -4px #4493F899",
                        }}
                      >
                        Connect repository
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              )}
            </>
          )}
        </section>
      </main>

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

      <LaunchOverlay launching={launching} />
    </div>
  );
}
