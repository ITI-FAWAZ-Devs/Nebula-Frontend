"use client";

import {
  AlertCircle,
  Eye,
  FileText,
  MoreHorizontalIcon,
  RotateCcw,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
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
import type { AdminDocumentationJobSummary } from "@/hooks/use-admin";
import {
  getDocumentationJobStatusStyle,
  isFailedDocumentationJobStatus,
} from "./status";

interface DocumentationJobsTableProps {
  jobs: AdminDocumentationJobSummary[];
  isFetching?: boolean;
  onView: (job: AdminDocumentationJobSummary) => void;
  onRetry: (job: AdminDocumentationJobSummary) => void;
}

export function formatJobId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 1) return "<1s";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function getJobDuration(job: AdminDocumentationJobSummary): string {
  if (job.finishedAt && job.startedAt) {
    return formatDurationMs(
      new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()
    );
  }
  if (job.status === "RUNNING" && job.startedAt) {
    return `${formatDurationMs(Date.now() - new Date(job.startedAt).getTime())} and running`;
  }
  return "—";
}

export function DocumentationJobsTable({
  jobs,
  isFetching = false,
  onView,
  onRetry,
}: DocumentationJobsTableProps) {
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
            <TableHead className="px-3">Job</TableHead>
            <TableHead className="px-3">Repository</TableHead>
            <TableHead className="px-3">User</TableHead>
            <TableHead className="px-3">Status</TableHead>
            <TableHead className="hidden px-3 md:table-cell">
              Created at
            </TableHead>
            <TableHead className="hidden px-3 sm:table-cell">Duration</TableHead>
            <TableHead className="px-3">Error</TableHead>
            <TableHead className="w-10 px-3 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const statusStyle = getDocumentationJobStatusStyle(job.status);
            const failed = isFailedDocumentationJobStatus(job.status);
            const displayName = job.user.fullName || "Unnamed user";
            return (
              <TableRow
                key={job.id}
                className="group border-white/8 hover:bg-white/[0.02]"
              >
                <TableCell className="px-3">
                  <button
                    type="button"
                    onClick={() => onView(job)}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-md"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60">
                      <FileText className="size-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span
                        className="truncate font-mono text-xs text-white/80"
                        title={job.id}
                      >
                        {formatJobId(job.id)}
                      </span>
                      {job.stage && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {job.stage}
                        </span>
                      )}
                    </span>
                  </button>
                </TableCell>
                <TableCell className="px-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60">
                      <FiGithub className="size-3" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-xs text-white/80">
                        {job.repository.name}
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {job.repository.owner}
                      </span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="px-3">
                  <span className="flex items-center gap-2">
                    <Avatar className="size-6 shrink-0">
                      <AvatarImage
                        src={job.user.avatar || undefined}
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
                      {job.user.email && (
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {job.user.email}
                        </span>
                      )}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="px-3">
                  <Badge
                    variant="outline"
                    className={cn("uppercase", statusStyle.className)}
                  >
                    {statusStyle.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden px-3 text-xs whitespace-nowrap text-muted-foreground md:table-cell">
                  {formatDateTime(job.createdAt)}
                </TableCell>
                <TableCell className="hidden px-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:table-cell">
                  {job.status === "RUNNING" ? (
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="size-1.5 animate-pulse rounded-full bg-sky-400" />
                      {getJobDuration(job)}
                    </span>
                  ) : (
                    getJobDuration(job)
                  )}
                </TableCell>
                <TableCell className="max-w-44 px-3">
                  {failed && job.error ? (
                    <span
                      className="flex items-center gap-1.5 truncate text-xs text-rose-400"
                      title={job.error}
                    >
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span className="truncate">{job.error}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-white/25">—</span>
                  )}
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
                        onClick={() => onView(job)}
                        className="cursor-pointer gap-2 rounded-md hover:bg-white/5 focus:bg-white/5"
                      >
                        <Eye className="size-3.5" />
                        View details
                      </DropdownMenuItem>
                      {failed && (
                        <>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={() => onRetry(job)}
                            className="cursor-pointer gap-2 rounded-md text-amber-400 hover:bg-white/5 focus:bg-white/5"
                          >
                            <RotateCcw className="size-3.5" />
                            Retry job
                          </DropdownMenuItem>
                        </>
                      )}
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

export function getJobError(job: AdminDocumentationJobSummary): string | null {
  if (!isFailedDocumentationJobStatus(job.status)) return null;
  return job.error || "No error details available.";
}
