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

interface RepoDeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function RepoDeleteConfirm({
  open,
  onOpenChange,
  repoName,
  onConfirm,
  isDeleting,
}: RepoDeleteConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-2">
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Disconnect Repository</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-1">
            Are you sure you want to remove <span className="text-white font-medium">{repoName}</span> from your hangar? This action deletes all cached metadata, indexed embeddings, and links.
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
              "Disconnect"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
