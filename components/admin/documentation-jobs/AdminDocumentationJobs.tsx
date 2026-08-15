"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileText,
  MoreHorizontalIcon,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminDocumentationJobsQuery,
  useRetryAdminDocumentationJobMutation,
  type AdminDocumentationJobStatus,
  type AdminDocumentationJobSummary,
} from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { DocumentationJobsTable } from "./DocumentationJobsTable";
import { DocumentationJobDetailDialog } from "./DocumentationJobDetailDialog";
import { RetryJobDialog } from "./RetryJobDialog";

const PAGE_SIZE = 10;

type JobStatusFilter = "ALL" | AdminDocumentationJobStatus;

const JOB_STATUS_OPTIONS: Array<{ value: AdminDocumentationJobStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "RUNNING", label: "Running" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function getPageItems(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return err?.response?.data?.message || err?.message || fallback;
}

export function AdminDocumentationJobs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatusFilter>("ALL");
  const [selectedJob, setSelectedJob] =
    useState<AdminDocumentationJobSummary | null>(null);
  const [retryTarget, setRetryTarget] =
    useState<AdminDocumentationJobSummary | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useAdminDocumentationJobsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const retryMutation = useRetryAdminDocumentationJobMutation();

  const hasActiveFilters =
    debouncedSearch.length > 0 || status !== "ALL";

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: JobStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPage(1);
  };

  const handleRetryConfirm = async () => {
    if (!retryTarget) return;
    try {
      await retryMutation.mutateAsync(retryTarget.id);
      toast.success(
        `Retry queued for job ${retryTarget.repository.name}`
      );
      setRetryTarget(null);
      setSelectedJob((selected) =>
        selected && selected.id === retryTarget.id ? null : selected
      );
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to retry documentation job.")
      );
    }
  };

  const totalPages = data?.pagination.totalPages ?? 0;
  const total = data?.pagination.total ?? 0;
  const rangeStart = data ? (data.pagination.page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = data
    ? Math.min(data.pagination.page * PAGE_SIZE, total)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            Documentation Jobs
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor documentation generation jobs, progress, and history
            across the platform.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search repository or user..."
              className="h-7 pl-7 sm:w-52"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => handleStatusChange(value as JobStatusFilter)}
          >
            <SelectTrigger className="h-7 w-36 cursor-pointer">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="glass-panel border border-white/10 bg-popover/95 text-white">
              <SelectItem value="ALL" className="cursor-pointer">
                All statuses
              </SelectItem>
              {JOB_STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
      </div>

      <div className="glass-panel overflow-hidden">
        {isPending ? (
          <DocumentationJobsTableSkeleton />
        ) : isError || !data ? (
          <DocumentationJobsErrorState
            message={getErrorMessage(error, "Failed to load documentation jobs.")}
            onRetry={() => refetch()}
          />
        ) : data.items.length === 0 ? (
          <DocumentationJobsEmptyState
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        ) : (
          <>
            <DocumentationJobsTable
              jobs={data.items}
              isFetching={isFetching}
              onView={setSelectedJob}
              onRetry={setRetryTarget}
            />
            <DocumentationJobsTableFooter
              page={data.pagination.page}
              totalPages={totalPages}
              total={total}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <DocumentationJobDetailDialog
        job={selectedJob}
        onOpenChange={(open) => {
          if (!open) setSelectedJob(null);
        }}
        onRetry={setRetryTarget}
        isRetrying={retryMutation.isPending}
      />

      <RetryJobDialog
        job={retryTarget}
        onOpenChange={(open) => {
          if (!open) setRetryTarget(null);
        }}
        onConfirm={handleRetryConfirm}
        isRetrying={retryMutation.isPending}
      />
    </div>
  );
}

function DocumentationJobsTableFooter({
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return (
      <div className="border-t border-white/8 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-white/80">
            {total.toLocaleString()}
          </span>{" "}
          {total === 1 ? "job" : "jobs"}
        </p>
      </div>
    );
  }

  const pageItems = getPageItems(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-white/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-white/80">
          {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
        </span>{" "}
        of{" "}
        <span className="font-medium text-white/80">
          {total.toLocaleString()}
        </span>{" "}
        jobs
      </p>

      <PaginationContent>
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="cursor-pointer gap-1 px-1.5"
          >
            <ChevronLeftIcon data-icon="inline-start" />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <span className="flex size-6 items-center justify-center text-muted-foreground">
                <MoreHorizontalIcon className="size-3.5" />
              </span>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <Button
                variant={item === page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                className="cursor-pointer"
              >
                {item}
              </Button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="cursor-pointer gap-1 px-1.5"
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </div>
  );
}

function DocumentationJobsTableSkeleton() {
  return (
    <div className="p-0">
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
            <TableHead className="w-10 px-3 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/8">
              <TableCell className="px-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-7 rounded-md" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-md" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2.5 w-28" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="hidden px-3 md:table-cell">
                <Skeleton className="h-3.5 w-24" />
              </TableCell>
              <TableCell className="hidden px-3 sm:table-cell">
                <Skeleton className="h-3.5 w-14" />
              </TableCell>
              <TableCell className="px-3">
                <Skeleton className="h-3.5 w-20" />
              </TableCell>
              <TableCell className="px-3 text-right">
                <Skeleton className="ml-auto size-6" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DocumentationJobsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Empty className="border-0 bg-rose-500/[0.04] p-10">
      <EmptyMedia
        variant="icon"
        className="size-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 [&>svg]:size-6"
      >
        <AlertTriangle />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">
          Failed to load documentation jobs
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

function DocumentationJobsEmptyState({
  hasActiveFilters,
  onClear,
}: {
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <Empty className="border-0 p-10">
      <EmptyMedia
        variant="icon"
        className="size-12 rounded-2xl border border-white/10 bg-white/5 text-white/60 [&>svg]:size-6"
      >
        <FileText />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">
          {hasActiveFilters
            ? "No documentation jobs match your filters"
            : "No documentation jobs yet"}
        </EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? "Try adjusting your search term or status filter."
            : "Documentation generation jobs will appear here once users generate docs."}
        </EmptyDescription>
      </EmptyHeader>
      {hasActiveFilters ? (
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="mt-1 cursor-pointer gap-2"
          >
            <X className="size-3.5" />
            Clear filters
          </Button>
        </EmptyContent>
      ) : (
        <EmptyContent>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="uppercase">
              Pending
            </Badge>
            <Badge variant="outline" className="uppercase">
              Running
            </Badge>
            <Badge variant="outline" className="uppercase">
              Completed
            </Badge>
            <Badge variant="outline" className="uppercase">
              Failed
            </Badge>
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
