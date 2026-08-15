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

interface DeleteRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryName: string | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteRepositoryDialog({
  open,
  onOpenChange,
  repositoryName,
  onConfirm,
  isDeleting,
}: DeleteRepositoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Delete Repository</AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-muted-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-medium text-white">
              {repositoryName ?? "this repository"}
            </span>
            ? Its documentation, embeddings, knowledge graph, and local clone
            will be removed. This action cannot be undone. Repositories with
            indexing or documentation jobs still in progress cannot be deleted
            yet.
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
