"use client";

import { FiGithub } from "react-icons/fi";
import { Eye, MoreHorizontalIcon, Trash2 } from "lucide-react";
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
import type { AdminUserSummary } from "@/hooks/use-admin";

export type RoleFilter = "ALL" | "USER" | "ADMIN";

interface UsersTableProps {
  users: AdminUserSummary[];
  currentUserId: string | null;
  isFetching?: boolean;
  onView: (user: AdminUserSummary) => void;
  onDelete: (user: AdminUserSummary) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UsersTable({
  users,
  currentUserId,
  isFetching = false,
  onView,
  onDelete,
}: UsersTableProps) {
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
            <TableHead className="px-3">User</TableHead>
            <TableHead className="px-3">Role</TableHead>
            <TableHead className="px-3">Status</TableHead>
            <TableHead className="px-3">GitHub</TableHead>
            <TableHead className="px-3 text-right">Repos</TableHead>
            <TableHead className="hidden px-3 lg:table-cell">Joined</TableHead>
            <TableHead className="w-10 px-3 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const displayName = user.fullName || "Unnamed user";
            return (
              <TableRow
                key={user.id}
                className="group border-white/8 hover:bg-white/[0.02]"
              >
                <TableCell className="px-3">
                  <button
                    type="button"
                    onClick={() => onView(user)}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-md"
                  >
                    <Avatar className="size-7 shrink-0">
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-col">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-white">
                        <span className="truncate">{displayName}</span>
                        {isSelf && (
                          <Badge variant="outline" className="px-1 text-[9px]">
                            You
                          </Badge>
                        )}
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                  </button>
                </TableCell>
                <TableCell className="px-3">
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "outline"}
                    className="uppercase"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-3">
                  <Badge
                    variant={user.isEmailVerified ? "secondary" : "outline"}
                    className={cn(
                      user.isEmailVerified &&
                        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    )}
                  >
                    {user.isEmailVerified ? "Active" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="px-3">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      user.githubConnected ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    <FiGithub
                      className={cn(
                        "size-3.5 shrink-0",
                        user.githubConnected ? "text-white" : "text-muted-foreground"
                      )}
                    />
                    <span className="whitespace-nowrap">
                      {user.githubConnected ? "Connected" : "Not connected"}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="px-3 text-right text-xs text-white/80 tabular-nums">
                  {user.repositoriesCount.toLocaleString()}
                </TableCell>
                <TableCell className="hidden px-3 text-xs text-muted-foreground whitespace-nowrap lg:table-cell">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="px-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Row actions"
                      className="inline-flex size-6 items-center justify-center rounded-md text-white/50 outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <MoreHorizontalIcon className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-panel min-w-40 border border-white/10 bg-popover/95 text-white">
                      <DropdownMenuItem
                        onClick={() => onView(user)}
                        className="cursor-pointer gap-2 rounded-md hover:bg-white/5 focus:bg-white/5"
                      >
                        <Eye className="size-3.5" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isSelf}
                        title={
                          isSelf
                            ? "You cannot delete your own account"
                            : undefined
                        }
                        onClick={() => onDelete(user)}
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
