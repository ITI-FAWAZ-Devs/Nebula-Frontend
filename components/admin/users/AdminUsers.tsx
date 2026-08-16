"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  RefreshCw,
  Search,
  Users,
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
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  type AdminUserSummary,
} from "@/hooks/use-admin";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UsersTable, type RoleFilter } from "./UsersTable";
import { UserDetailDialog } from "./UserDetailDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";

const PAGE_SIZE = 10;

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

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Failed to load users."
  );
}

export function AdminUsers() {
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminUserSummary | null>(
    null
  );

  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useAdminUsersQuery({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    role: role === "ALL" ? undefined : role,
  });

  const deleteMutation = useDeleteAdminUserMutation();

  const hasActiveFilters = debouncedSearch.length > 0 || role !== "ALL";

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: RoleFilter) => {
    setRole(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRole("ALL");
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(
        `${deleteTarget.fullName || deleteTarget.email} deleted successfully`
      );
      if (data?.items.length === 1 && page > 1) {
        setPage(page - 1);
      }
      setSelectedUser((selected) =>
        selected && selected.id === deleteTarget.id ? null : selected
      );
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to delete user.");
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
            Users
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage user accounts, roles, and platform access.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name or email..."
              className="h-7 pl-7 sm:w-56"
            />
          </div>

          <Select
            value={role}
            onValueChange={(value) => handleRoleChange(value as RoleFilter)}
          >
            <SelectTrigger className="h-7 w-32 cursor-pointer">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent className="glass-panel border border-white/10 bg-popover/95 text-white">
              <SelectItem value="ALL" className="cursor-pointer">
                All roles
              </SelectItem>
              <SelectItem value="USER" className="cursor-pointer">
                User
              </SelectItem>
              <SelectItem value="ADMIN" className="cursor-pointer">
                Admin
              </SelectItem>
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
          <UsersTableSkeleton />
        ) : isError || !data ? (
          <UsersErrorState
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
          />
        ) : data.items.length === 0 ? (
          <UsersEmptyState
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        ) : (
          <>
            <UsersTable
              users={data.items}
              currentUserId={currentUserId}
              isFetching={isFetching}
              onView={setSelectedUser}
              onDelete={setDeleteTarget}
            />
            <UsersTableFooter
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

      <UserDetailDialog
        user={selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      />

      <DeleteUserDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        userName={deleteTarget?.fullName || deleteTarget?.email || null}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

function UsersTableFooter({
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
          <span className="font-medium text-white/80">{total.toLocaleString()}</span>{" "}
          {total === 1 ? "user" : "users"}
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
        <span className="font-medium text-white/80">{total.toLocaleString()}</span>{" "}
        users
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

function UsersTableSkeleton() {
  return (
    <div className="p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 hover:bg-transparent">
            <TableHead className="px-3">User</TableHead>
            <TableHead className="px-3">Role</TableHead>
            <TableHead className="px-3">Status</TableHead>
            <TableHead className="px-3">GitHub</TableHead>
            <TableHead className="px-3 text-right">Repos</TableHead>
            <TableHead className="px-3 text-right">AI / Q&amp;A</TableHead>
            <TableHead className="hidden px-3 lg:table-cell">Joined</TableHead>
            <TableHead className="w-10 px-3 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/8">
              <TableCell className="px-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-7 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-40" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <Skeleton className="h-5 w-14 rounded-full" />
              </TableCell>
              <TableCell className="px-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="px-3">
                <Skeleton className="h-3.5 w-20" />
              </TableCell>
              <TableCell className="px-3 text-right">
                <Skeleton className="ml-auto h-3.5 w-6" />
              </TableCell>
              <TableCell className="px-3 text-right">
                <Skeleton className="ml-auto h-3.5 w-6" />
              </TableCell>
              <TableCell className="hidden px-3 lg:table-cell">
                <Skeleton className="h-3.5 w-24" />
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

function UsersErrorState({
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
        <EmptyTitle className="text-white">Failed to load users</EmptyTitle>
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

function UsersEmptyState({
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
        <Users />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">
          {hasActiveFilters ? "No users match your filters" : "No users yet"}
        </EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? "Try adjusting your search term or role filter."
            : "Users will appear here once they register on the platform."}
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
              USER
            </Badge>
            <Badge variant="default" className="uppercase">
              ADMIN
            </Badge>
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
