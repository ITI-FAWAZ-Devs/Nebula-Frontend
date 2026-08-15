"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  FileClock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
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
  useAdminRepositoryQuery,
  type AdminDocumentationJobStatus,
  type AdminDocStatus,
  type AdminRepositoryDetail,
  type AdminRepositorySummary,
} from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import {
  documentationJobStatusStyles,
  documentationStatusStyles,
  repositoryStatusStyles,
} from "./status";

interface RepositoryDetailDialogProps {
  repository: AdminRepositorySummary | null;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (repository: AdminRepositorySummary) => void;
  isRegenerating: boolean;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCommit(value: string | null | undefined): string {
  if (!value) return "—";
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Failed to load repository details."
  );
}

export function RepositoryDetailDialog({
  repository,
  onOpenChange,
  onRegenerate,
  isRegenerating,
}: RepositoryDetailDialogProps) {
  const repositoryId = repository?.id ?? null;
  const {
    data: detail,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminRepositoryQuery(repositoryId);

  const displayName = repository?.name ?? "Repository";

  return (
    <Dialog open={!!repository} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-background/95 backdrop-blur-xl text-white sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 ring-2 ring-primary/20">
              <FiGithub className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="flex min-w-0 items-center gap-1.5 font-display text-base font-semibold text-white">
                <span className="truncate">{displayName}</span>
                {repository?.githubUrl && (
                  <a
                    href={repository.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={`Open ${repository.githubUrl}`}
                    className="text-white/30 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
                  >
                    <ArrowUpRight className="size-3.5" />
                    <span className="sr-only">Open on GitHub</span>
                  </a>
                )}
              </DialogTitle>
              <DialogDescription className="truncate font-mono text-[10px] text-white/50">
                {repository?.owner}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isPending ? (
          <RepositoryDetailLoading />
        ) : isError || !detail ? (
          <RepositoryDetailError
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
                <RepositoryBadges detail={detail} />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <DetailStat
                  label="Doc Jobs"
                  value={detail.documentationJobsCount}
                />
                <DetailStat
                  label="Analysis Jobs"
                  value={detail.analysisJobsCount}
                />
                <DetailStat
                  label="Doc Versions"
                  value={detail.generatedDocVersions.length}
                />
                <DetailStat
                  label="Verification"
                  value={
                    detail.latestGeneratedDoc?.verificationScore != null
                      ? `${Math.round(detail.latestGeneratedDoc.verificationScore * 100)}%`
                      : "—"
                  }
                />
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Imported by
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm" className="shrink-0">
                    <AvatarImage
                      src={detail.user.avatar || undefined}
                      alt={detail.user.fullName || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {(detail.user.fullName || "U").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-white/80">
                      {detail.user.fullName || "Unnamed user"}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {detail.user.email ?? "No email on file"}
                    </p>
                  </div>
                  {detail.organization && (
                    <Badge variant="outline" className="max-w-32 truncate">
                      {detail.organization.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                <InfoRow label="Default branch" value={detail.defaultBranch} />
                <InfoRow
                  label="Imported"
                  value={formatDate(detail.importDate)}
                />
                <InfoRow
                  label="Last generation"
                  value={formatDateTime(detail.lastDocumentationGeneration)}
                />
                <InfoRow
                  label="Last indexed commit"
                  value={formatCommit(detail.lastIndexedCommit)}
                  mono
                />
                <InfoRow
                  label="Documented commit"
                  value={formatCommit(detail.documentedCommit)}
                  mono
                />
                <InfoRow
                  label="Created"
                  value={formatDate(detail.createdAt)}
                />
              </div>

              {detail.latestDocumentationJob && (
                <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Latest documentation job
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <JobStatusBadge status={detail.latestDocumentationJob.status} />
                    {detail.latestDocumentationJob.stage && (
                      <span className="text-xs text-white/70">
                        {detail.latestDocumentationJob.stage}
                      </span>
                    )}
                    {detail.latestDocumentationJob.progress != null && (
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                        {detail.latestDocumentationJob.progress}%
                      </span>
                    )}
                  </div>
                  {detail.latestDocumentationJob.error && (
                    <p className="rounded-md border border-rose-500/20 bg-rose-500/[0.06] px-2.5 py-1.5 text-[11px] text-rose-400 break-words">
                      {detail.latestDocumentationJob.error}
                    </p>
                  )}
                </div>
              )}

              {detail.generatedDocVersions.length > 0 && (
                <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Documentation versions
                  </span>
                  <div className="flex flex-col gap-2">
                    {detail.generatedDocVersions.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <Badge variant="outline" className="w-12 justify-center">
                          v{doc.version}
                        </Badge>
                        <DocVersionStatusBadge status={doc.status} />
                        <span className="ml-auto whitespace-nowrap font-mono text-[10px] text-muted-foreground tabular-nums">
                          {formatDate(doc.generatedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-white/8 pt-3">
              <p className="font-mono text-[10px] text-muted-foreground">
                Updated {formatDate(detail.updatedAt)}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    repository && onRegenerate(repository)
                  }
                  disabled={isRegenerating}
                  className="cursor-pointer gap-2"
                >
                  <FileClock className="size-3.5" />
                  Regenerate
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RepositoryBadges({ detail }: { detail: AdminRepositoryDetail }) {
  const repositoryStatus = repositoryStatusStyles[detail.repositoryStatus];
  const docStatus = documentationStatusStyles[detail.documentationStatus];
  return (
    <>
      <Badge
        variant="outline"
        className={cn("uppercase", repositoryStatus.className)}
      >
        {repositoryStatus.label}
      </Badge>
      <Badge
        variant="outline"
        className={cn(
          "uppercase",
          docStatus.className,
          detail.documentationStatus === "NOT_GENERATED" &&
            "border-white/10 bg-transparent text-muted-foreground"
        )}
      >
        {docStatus.label}
      </Badge>
      {detail.isPrivate ? (
        <Badge variant="outline" className="uppercase">
          Private
        </Badge>
      ) : (
        <Badge variant="outline" className="uppercase">
          Public
        </Badge>
      )}
    </>
  );
}

function DetailStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-2.5",
        className
      )}
    >
      <span className="truncate font-display text-base font-semibold text-white tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "truncate text-xs text-white/80",
          mono && "font-mono text-[11px]"
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function JobStatusBadge({ status }: { status: AdminDocumentationJobStatus }) {
  const style = documentationJobStatusStyles[status];
  return (
    <Badge variant="outline" className={cn("uppercase", style?.className)}>
      {style?.label ?? status}
    </Badge>
  );
}

function DocVersionStatusBadge({ status }: { status: AdminDocStatus }) {
  const style = documentationStatusStyles[status];
  return (
    <Badge variant="outline" className={cn("uppercase", style?.className)}>
      {style?.label ?? status}
    </Badge>
  );
}

function RepositoryDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

function RepositoryDetailError({
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
          Failed to load repository details
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
