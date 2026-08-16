"use client";

import { FileClock, Loader2 } from "lucide-react";
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

interface RegenerateDocumentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryName: string | null;
  onConfirm: () => void;
  isRegenerating: boolean;
}

export function RegenerateDocumentationDialog({
  open,
  onOpenChange,
  repositoryName,
  onConfirm,
  isRegenerating,
}: RegenerateDocumentationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
            <FileClock className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Regenerate Documentation</AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-muted-foreground">
            This will queue a new architecture documentation generation for{" "}
            <span className="font-medium text-white">
              {repositoryName ?? "this repository"}
            </span>
            . If the repository is already up to date with the latest commit, no
            new version will be created.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            className="cursor-pointer"
            disabled={isRegenerating}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isRegenerating}
            className="cursor-pointer rounded-md bg-sky-600 font-mono text-xs uppercase tracking-wider text-white hover:bg-sky-700"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Regenerating...
              </>
            ) : (
              "Regenerate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
