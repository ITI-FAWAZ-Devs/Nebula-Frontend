"use client";

import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteOrgConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteOrgConfirm({
  open,
  onOpenChange,
  orgName,
  onConfirm,
  isDeleting,
}: DeleteOrgConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-2">
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-1">
            Are you sure you want to permanently delete{" "}
            <span className="text-white font-medium">{orgName}</span>? This
            will remove all members, roles, connections, and scoped repositories.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-md font-mono text-xs uppercase tracking-wider cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Organization"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
