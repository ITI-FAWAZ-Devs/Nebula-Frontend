"use client";

import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  Rocket,
  BookOpen,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";

import { Repository, RepositoryStatus } from "@/hooks/use-repository";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "indexed" | "indexing" | "pending" | "failed";

interface DocMeta {
  hasDoc: boolean;
  version: number | null;
}

interface RepoTableProps {
  repos: Repository[];
  docStatusByRepo: Record<string, DocMeta>;
  regeneratingId: string | null;
  onOpen: (repo: Repository) => void;
  onDetailClick: (repo: Repository) => void;
  onRegenerate: (repo: Repository) => void;
  onDeleteClick: (repo: Repository) => void;
}

function statusPresentation(status: RepositoryStatus) {
  switch (status) {
    case "READY":
      return { label: "Indexed", dot: "bg-emerald-400", text: "text-emerald-400", kind: "ready" as const };
    case "INDEXING":
    case "CLONING":
      return {
        label: status === "CLONING" ? "Cloning" : "Indexing",
        dot: "bg-sky-400",
        text: "text-sky-400",
        kind: "progress" as const,
      };
    case "FAILED":
      return { label: "Failed", dot: "bg-rose-400", text: "text-rose-400", kind: "failed" as const };
    default:
      return { label: "Pending", dot: "bg-violet-400", text: "text-violet-400", kind: "pending" as const };
  }
}

function primaryAction(
  status: RepositoryStatus,
  hasDoc: boolean
): { label: string; icon: LucideIcon; spinning?: boolean } {
  switch (status) {
    case "READY":
      return hasDoc
        ? { label: "Open", icon: BookOpen }
        : { label: "Generate", icon: FileText };
    case "INDEXING":
    case "CLONING":
      return { label: "View", icon: Loader2, spinning: true };
    case "FAILED":
      return { label: "Retry", icon: RefreshCw };
    default:
      return { label: "Index", icon: Rocket };
  }
}

function githubHostPath(repo: Repository) {
  return `github.com/${repo.owner}/${repo.name}`;
}

export function matchesStatusFilter(repo: Repository, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "indexed") return repo.status === "READY";
  if (filter === "indexing") return repo.status === "INDEXING" || repo.status === "CLONING";
  if (filter === "pending") return repo.status === "IMPORTED";
  if (filter === "failed") return repo.status === "FAILED";
  return true;
}

export function RepoTable({
  repos,
  docStatusByRepo,
  regeneratingId,
  onOpen,
  onDetailClick,
  onRegenerate,
  onDeleteClick,
}: RepoTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="h-11 px-4 text-[11px] font-medium text-muted-foreground">
              Repository
            </TableHead>
            <TableHead className="h-11 px-4 text-[11px] font-medium text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="h-11 px-4 text-[11px] font-medium text-muted-foreground">
              Last indexed
            </TableHead>
            <TableHead className="h-11 px-4 text-[11px] font-medium text-muted-foreground">
              Documents
            </TableHead>
            <TableHead className="h-11 w-[1%] whitespace-nowrap px-4 text-right text-[11px] font-medium text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repos.map((repo) => {
            const status = statusPresentation(repo.status);
            const doc = docStatusByRepo[repo.id];
            const hasDoc = !!doc?.hasDoc;
            const action = primaryAction(repo.status, hasDoc);
            const ActionIcon = action.icon;
            const isRegenerating = regeneratingId === repo.id;
            const lastIndexed =
              repo.status === "READY"
                ? formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })
                : null;

            return (
              <TableRow
                key={repo.id}
                className="border-white/5 hover:bg-white/[0.03]"
              >
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                      <FiGithub className="h-4 w-4 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-white">
                          {repo.name}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            repo.isPrivate
                              ? "border-white/10 bg-white/5 text-muted-foreground"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          )}
                        >
                          {repo.isPrivate ? "Private" : "Public"}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {githubHostPath(repo)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4">
                  <div className="flex flex-col gap-1.5 min-w-[7.5rem]">
                    <div className={cn("inline-flex items-center gap-2 text-xs", status.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </div>
                    {status.kind === "progress" && (
                      <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-2/5 animate-pulse rounded-full bg-sky-400" />
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4 text-xs text-muted-foreground">
                  {lastIndexed ?? "—"}
                </TableCell>

                <TableCell className="px-4 py-4 text-xs text-muted-foreground tabular-nums">
                  {hasDoc ? (doc?.version ?? 1) : "—"}
                </TableCell>

                <TableCell className="w-[1%] whitespace-nowrap px-4 py-4">
                  <div className="ml-auto flex w-fit items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpen(repo)}
                      className="h-8 shrink-0 rounded-lg border border-white/15 bg-transparent px-3.5 text-xs font-medium text-white hover:bg-white/5 cursor-pointer"
                    >
                      <ActionIcon
                        className={cn(
                          "mr-1.5 h-3.5 w-3.5",
                          action.spinning && "animate-spin"
                        )}
                      />
                      {action.label}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 glass-panel border border-white/10 bg-popover/90 backdrop-blur p-1 text-white"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer rounded-md text-xs"
                          onClick={() => onDetailClick(repo)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </DropdownMenuItem>
                        {hasDoc && (
                          <DropdownMenuItem
                            className="cursor-pointer rounded-md text-xs"
                            disabled={isRegenerating}
                            onClick={() => onRegenerate(repo)}
                          >
                            {isRegenerating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            Regenerate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="cursor-pointer rounded-md text-xs text-rose-400 focus:text-rose-300"
                          onClick={() => onDeleteClick(repo)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
