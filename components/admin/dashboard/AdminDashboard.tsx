"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  FolderGit2,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStatsQuery } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { DashboardSection } from "./DashboardSection";
import { DocumentationStatsCard } from "./DocumentationStatsCard";
import { RepositoriesStatsCard } from "./RepositoriesStatsCard";
import { StatsCard, StatsCardSkeleton } from "./StatsCard";
import { UsersStatsCard } from "./UsersStatsCard";

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Failed to load dashboard statistics."
  );
}

export function AdminDashboard() {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useDashboardStatsQuery();

  if (isPending) {
    return <DashboardLoading />;
  }

  if (isError || !data) {
    return <DashboardError message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  const hasData =
    data.totalUsers > 0 ||
    data.totalImportedRepositories > 0 ||
    data.totalDocumentationJobs > 0;

  if (!hasData) {
    return <DashboardEmpty onRefresh={() => refetch()} />;
  }

  const activeRate =
    data.totalUsers > 0
      ? Math.round((data.activeUsers / data.totalUsers) * 100)
      : 0;
  const successRate =
    data.totalDocumentationJobs > 0
      ? Math.round(
          (data.successfulDocumentationJobs / data.totalDocumentationJobs) * 100
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            Overview
          </h2>
          <p className="text-xs text-muted-foreground">
            Platform-wide metrics across users, repositories and documentation.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="cursor-pointer gap-2"
        >
          <RefreshCw
            className={cn("size-3.5", isRefetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Total Users"
          value={data.totalUsers}
          icon={Users}
          accent="blue"
        />
        <StatsCard
          title="Active Users"
          value={data.activeUsers}
          icon={UserCheck}
          accent="cyan"
          footer={`${activeRate}% of all users`}
        />
        <StatsCard
          title="Repositories"
          value={data.totalImportedRepositories}
          icon={FolderGit2}
          accent="purple"
        />
        <StatsCard
          title="Documentation Jobs"
          value={data.totalDocumentationJobs}
          icon={FileText}
          accent="amber"
        />
        <StatsCard
          title="Doc Success Rate"
          value={`${successRate}%`}
          icon={CheckCircle2}
          accent="green"
          footer="of documentation jobs completed"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <UsersStatsCard stats={data} />
        <RepositoriesStatsCard stats={data} />
        <DocumentationStatsCard stats={data} />
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <DashboardSectionSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function DashboardSectionSkeleton() {
  return (
    <DashboardSection title="">
      <Skeleton className="h-[200px] w-full" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </DashboardSection>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Empty className="glass-panel mx-auto max-w-lg border-rose-500/20 bg-rose-500/[0.04] p-10">
      <EmptyMedia
        variant="icon"
        className="size-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 [&>svg]:size-6"
      >
        <AlertTriangle />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">Failed to load dashboard</EmptyTitle>
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

function DashboardEmpty({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Empty className="glass-panel mx-auto max-w-lg p-10">
      <EmptyMedia
        variant="icon"
        className="size-12 rounded-2xl border border-white/10 bg-white/5 text-white/60 [&>svg]:size-6"
      >
        <Database />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">No platform activity yet</EmptyTitle>
        <EmptyDescription>
          Statistics will populate here as users, repositories and
          documentation jobs are created.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="mt-1 cursor-pointer gap-2"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  );
}
