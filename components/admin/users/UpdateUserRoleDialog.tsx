"use client";

import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminUserRole } from "@/hooks/use-admin";

interface UpdateUserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string | null;
  role: AdminUserRole;
  onConfirm: () => void;
  isUpdating: boolean;
}

export function UpdateUserRoleDialog({
  open,
  onOpenChange,
  userName,
  role,
  onConfirm,
  isUpdating,
}: UpdateUserRoleDialogProps) {
  const promoting = role === "ADMIN";
  const Icon = promoting ? ShieldCheck : ShieldOff;
  const title = promoting ? "Promote to admin" : "Demote to user";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div
            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
              promoting
                ? "bg-primary/10 text-primary"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-1">
            {promoting ? (
              <>
                Are you sure you want to promote{" "}
                <span className="font-medium text-white">
                  {userName ?? "this user"}
                </span>{" "}
                to admin? They will gain full access to platform management,
                including users, repositories, and documentation jobs.
              </>
            ) : (
              <>
                Are you sure you want to demote{" "}
                <span className="font-medium text-white">
                  {userName ?? "this user"}
                </span>{" "}
                to user? They will lose access to the admin dashboard and all
                platform management features.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="cursor-pointer" disabled={isUpdating}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isUpdating}
            className="cursor-pointer rounded-md bg-primary font-mono text-xs uppercase tracking-wider text-white hover:bg-primary/90"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              title
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
