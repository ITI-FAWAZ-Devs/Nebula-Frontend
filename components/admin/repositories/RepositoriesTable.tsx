"use client";

import { FiGithub } from "react-icons/fi";
import {
  ArrowUpRight,
  Eye,
  FileClock,
  MoreHorizontalIcon,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AdminRepositorySummary } from "@/hooks/use-admin";
import {
  documentationStatusStyles,
  isActiveDocStatus,
  repositoryStatusStyles,
} from "./status";

interface RepositoriesTableProps {
  repositories: AdminRepositorySummary[];
  isFetching?: boolean;
  onView: (repository: AdminRepositorySummary) => void;
  onRegenerate: (repository: AdminRepositorySummary) => void;
  onDelete: (repository: AdminRepositorySummary) => void;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RepositoriesTable({
  repositories,
  isFetching = false,
  onView,
  onRegenerate,
  onDelete,
}: RepositoriesTableProps) {
  return (
    <div
      className={cn(
        "transition-opacity",
        isFetching && "pointer-events-none opacity-60"
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 hover:bg-transparent">
            <TableHead className="px-3">Repository</TableHead>
            <TableHead className="px-3">User</TableHead>
            <TableHead className="px-3">Status</TableHead>
            <TableHead className="px-3">Documentation</TableHead>
            <TableHead className="hidden px-3 md:table-cell">
              Last generation
            </TableHead>
            <TableHead className="px-3 text-right" title="AI Q&A requests against this repository">
              Q&amp;A
            </TableHead>
            <TableHead className="w-10 px-3 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repositories.map((repository) => {
            const displayName = repository.user.fullName || "Unnamed user";
            const repoStatus = repositoryStatusStyles[repository.repositoryStatus];
            const docStatus = documentationStatusStyles[repository.documentationStatus];
            return (
              <TableRow
                key={repository.id}
                className="group border-white/8 hover:bg-white/[0.02]"
              >
                <TableCell className="px-3">
                  <button
                    type="button"
                    onClick={() => onView(repository)}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-md"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60">
                      <FiGithub className="size-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-white">
                        <span className="truncate">{repository.name}</span>
                        {repository.isPrivate && (
                          <Badge
                            variant="outline"
                            className="px-1 text-[9px] uppercase"
                          >
                            Private
                          </Badge>
                        )}
                        <a
                          href={repository.githubUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(event) => event.stopPropagation()}
                          title={`Open ${repository.githubUrl}`}
                          className="text-white/30 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
                        >
                          <ArrowUpRight className="size-3" />
                          <span className="sr-only">Open on GitHub</span>
                        </a>
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {repository.owner}
                      </span>
                    </span>
                  </button>
                </TableCell>
                <TableCell className="px-3">
                  <span className="flex items-center gap-2">
                    <Avatar className="size-6 shrink-0">
                      <AvatarImage
                        src={repository.user.avatar || undefined}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-xs text-white/80">
                        {displayName}
                      </span>
                      {repository.user.email && (
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {repository.user.email}
                        </span>
                      )}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="px-3">
                  <Badge
                    variant="outline"
                    className={cn("uppercase", repoStatus.className)}
                  >
                    {repoStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="px-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "uppercase",
                      docStatus.className,
                      repository.documentationStatus === "NOT_GENERATED" &&
                        "border-white/10 bg-transparent text-muted-foreground"
                    )}
                  >
                    {docStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden px-3 text-xs whitespace-nowrap text-muted-foreground md:table-cell">
                  {isActiveDocStatus(repository.documentationStatus) ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <FileClock className="size-3.5" />
                      In progress
                    </span>
                  ) : (
                    formatDate(repository.lastArchDocGeneratedAt)
                  )}
                </TableCell>
                <TableCell className="px-3 text-right text-xs whitespace-nowrap text-white/80 tabular-nums">
                  <span title="AI Q&A requests">
                    {repository.qaRequestsCount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="px-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Row actions"
                      className="inline-flex size-6 items-center justify-center rounded-md text-white/50 outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <MoreHorizontalIcon className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-panel min-w-44 border border-white/10 bg-popover/95 text-white">
                      <DropdownMenuItem
                        onClick={() => onView(repository)}
                        className="cursor-pointer gap-2 rounded-md hover:bg-white/5 focus:bg-white/5"
                      >
                        <Eye className="size-3.5" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRegenerate(repository)}
                        className="cursor-pointer gap-2 rounded-md hover:bg-white/5 focus:bg-white/5"
                      >
                        <FileClock className="size-3.5" />
                        Regenerate documentation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(repository)}
                        className="cursor-pointer gap-2 rounded-md"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
