"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  useAdminUserQuery,
  type AdminUserSummary,
} from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

interface UserDetailDialogProps {
  user: AdminUserSummary | null;
  onOpenChange: (open: boolean) => void;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Failed to load user details."
  );
}

export function UserDetailDialog({ user, onOpenChange }: UserDetailDialogProps) {
  const userId = user?.id ?? null;
  const {
    data: detail,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminUserQuery(userId);

  const displayName = user?.fullName || user?.email || "User";

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-background/95 backdrop-blur-xl text-white sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="size-10 shrink-0 ring-2 ring-primary/20">
              <AvatarImage
                src={user?.avatar || undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DialogTitle className="font-display text-base font-semibold text-white">
                {displayName}
              </DialogTitle>
              <DialogDescription className="truncate font-mono text-[10px] text-white/50">
                {user?.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isPending ? (
          <UserDetailLoading />
        ) : isError || !detail ? (
          <UserDetailError
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
                <Badge
                  variant={detail.role === "ADMIN" ? "default" : "outline"}
                  className="uppercase"
                >
                  {detail.role}
                </Badge>
                <Badge variant="outline" className="uppercase">
                  {detail.subscriptionTier}
                </Badge>
                <Badge
                  variant={detail.isEmailVerified ? "secondary" : "outline"}
                  className={cn(
                    detail.isEmailVerified &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  )}
                >
                  {detail.isEmailVerified ? "Active" : "Pending"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <DetailStat label="Repositories" value={detail.repositoriesCount} />
                <DetailStat
                  label="AI / Q&A"
                  value={detail.usageLogsCount}
                  hint="AI usage & Q&A interactions"
                />
                <DetailStat label="Organizations" value={detail.organizationsCount} />
                <DetailStat label="Owned Orgs" value={detail.ownedOrganizationsCount} />
                <DetailStat label="Generations" value={detail.totalGenerationsUsed} />
                <DetailStat
                  label="This Period"
                  value={detail.generationsUsedThisPeriod}
                />
                <DetailStat
                  label="Last Activity"
                  value={detail.lastUsageAt ? formatDate(detail.lastUsageAt) : "—"}
                  className="col-span-2 sm:col-span-1"
                />
                <DetailStat
                  label="Joined"
                  value={formatDate(detail.createdAt)}
                  className="col-span-2 sm:col-span-1"
                />
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <FiGithub className="size-3" />
                  GitHub connections
                </span>
                {detail.accounts.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {detail.accounts.map((account) => (
                      <div
                        key={`${account.provider}-${account.createdAt}`}
                        className="flex items-center gap-2"
                      >
                        <Avatar size="sm" className="shrink-0">
                          <AvatarImage
                            src={account.providerAvatar || undefined}
                            alt={account.providerUsername || account.provider}
                          />
                          <AvatarFallback className="bg-white/5 text-[9px]">
                            {account.provider.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate text-xs text-white/80">
                          {account.providerUsername ?? account.provider}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatDate(account.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No GitHub account linked.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
                <p className="font-mono text-[10px] text-muted-foreground">
                  Updated {formatDate(detail.updatedAt)}
                </p>
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
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailStat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-2.5",
        className
      )}
      title={hint}
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

function UserDetailLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function UserDetailError({
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
        <EmptyTitle className="text-white">Failed to load user details</EmptyTitle>
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
