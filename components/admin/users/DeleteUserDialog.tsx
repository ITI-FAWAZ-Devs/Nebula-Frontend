"use client";

import { Loader2, Trash2 } from "lucide-react";
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

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isDeleting,
}: DeleteUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-2">
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-1">
            Are you sure you want to permanently delete{" "}
            <span className="font-medium text-white">
              {userName ?? "this user"}
            </span>
            ? Their account and associated data will be removed. This action
            cannot be undone. Users who own repositories or organizations must
            be cleaned up first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            className="cursor-pointer"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="cursor-pointer rounded-md bg-rose-600 font-mono text-xs uppercase tracking-wider text-white hover:bg-rose-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
