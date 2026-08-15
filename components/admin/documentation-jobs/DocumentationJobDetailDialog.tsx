"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  useAdminDocumentationJobQuery,
  type AdminDocumentationJobDetail,
  type AdminDocumentationJobSummary,
} from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { formatDateTime, formatJobId, getJobDuration } from "./DocumentationJobsTable";
import {
  getDocumentationJobStatusStyle,
  isFailedDocumentationJobStatus,
} from "./status";

interface DocumentationJobDetailDialogProps {
  job: AdminDocumentationJobSummary | null;
  onOpenChange: (open: boolean) => void;
  onRetry: (job: AdminDocumentationJobSummary) => void;
  isRetrying: boolean;
}

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Failed to load job details."
  );
}

export function DocumentationJobDetailDialog({
  job,
  onOpenChange,
  onRetry,
  isRetrying,
}: DocumentationJobDetailDialogProps) {
  const jobId = job?.id ?? null;
  const {
    data: detail,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminDocumentationJobQuery(jobId);

  const failed = job ? isFailedDocumentationJobStatus(job.status) : false;
  const displayName = job?.user.fullName || "Unnamed user";

  return (
    <Dialog open={!!job} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-background/95 backdrop-blur-xl text-white sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 ring-2 ring-primary/20">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-display text-base font-semibold text-white">
                Documentation Job
              </DialogTitle>
              <DialogDescription className="truncate font-mono text-[10px] text-white/50">
                {job ? formatJobId(job.id) : "—"} · {job?.repository.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isPending ? (
          <JobDetailLoading />
        ) : isError || !detail ? (
          <JobDetailError
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <div
              className={cn(
                "flex flex-col gap-4",
                isFetching && "pointer-events-none opacity-60"
              )}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <JobStatusBadge detail={detail} />
                {detail.stage && (
                  <Badge variant="outline" className="uppercase">
                    {detail.stage}
                  </Badge>
                )}
                {detail.progress != null && (
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                    {detail.progress}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <DetailStat
                  label="Progress"
                  value={
                    detail.progress != null ? `${detail.progress}%` : "—"
                  }
                />
                <DetailStat
                  label="Resumes"
                  value={detail.resumeCount}
                />
                <DetailStat
                  label="Duration"
                  value={getJobDuration(detail)}
                />
                <DetailStat
                  label="Created"
                  value={formatDateTime(detail.createdAt)}
                />
                <DetailStat
                  label="Started"
                  value={formatDateTime(detail.startedAt)}
                />
                <DetailStat
                  label="Finished"
                  value={formatDateTime(detail.finishedAt)}
                />
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Repository
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-white/80">
                      <span className="truncate">
                        {detail.repository.name}
                      </span>
                      <a
                        href={detail.repository.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        title={detail.repository.githubUrl}
                        className="shrink-0 text-white/30 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
                      >
                        <ArrowUpRight className="size-3" />
                        <span className="sr-only">Open on GitHub</span>
                      </a>
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {detail.repository.owner}
                    </p>
                  </div>
                  <Badge variant="outline" className="uppercase">
                    {detail.repository.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  User
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm" className="shrink-0">
                    <AvatarImage
                      src={detail.user.avatar || undefined}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-white/80">
                      {displayName}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {detail.user.email ?? "No email on file"}
                    </p>
                  </div>
                </div>
              </div>

              {detail.error && (
                <div className="flex flex-col gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-rose-400/80">
                    Error
                  </span>
                  <p className="rounded-md border border-rose-500/20 bg-rose-500/[0.06] px-2.5 py-1.5 text-[11px] text-rose-400 break-words">
                    {detail.error}
                  </p>
                </div>
              )}

              {detail.queueJobId && (
                <div className="flex flex-col gap-0.5 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Queue job
                  </span>
                  <span className="truncate font-mono text-[11px] text-white/70">
                    {detail.queueJobId}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-white/8 pt-3">
              <p className="font-mono text-[10px] text-muted-foreground">
                Updated {formatDateTime(detail.updatedAt)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="cursor-pointer gap-2"
                >
                  <Loader2
                    className={cn("size-3.5", isFetching && "animate-spin")}
                  />
                  Refresh
                </Button>
                {failed && job && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(job)}
                    disabled={isRetrying}
                    className="cursor-pointer gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    <RotateCcw className="size-3.5" />
                    Retry
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function JobStatusBadge({ detail }: { detail: AdminDocumentationJobDetail }) {
  const style = getDocumentationJobStatusStyle(detail.status);
  return (
    <Badge variant="outline" className={cn("uppercase", style.className)}>
      {style.label}
    </Badge>
  );
}

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <span className="truncate font-display text-sm font-semibold text-white tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function JobDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

function JobDetailError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Empty className="rounded-lg border-rose-500/20 bg-rose-500/[0.04] p-6">
      <EmptyMedia
        variant="icon"
        className="size-10 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400"
      >
        <AlertTriangle />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">
          Failed to load job details
        </EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-1 cursor-pointer gap-2"
        >
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
}
