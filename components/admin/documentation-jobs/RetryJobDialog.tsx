"use client";

import { Loader2, RotateCcw } from "lucide-react";
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
import { formatJobId, getJobError } from "./DocumentationJobsTable";
import type { AdminDocumentationJobSummary } from "@/hooks/use-admin";

interface RetryJobDialogProps {
  job: AdminDocumentationJobSummary | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isRetrying: boolean;
}

export function RetryJobDialog({
  job,
  onOpenChange,
  onConfirm,
  isRetrying,
}: RetryJobDialogProps) {
  const errorMessage = job ? getJobError(job) : null;

  return (
    <AlertDialog open={!!job} onOpenChange={onOpenChange}>
      <AlertDialogContent className="premium-panel border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <RotateCcw className="h-5 w-5" />
          </div>
          <AlertDialogTitle>Retry Documentation Job</AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-muted-foreground">
            This will queue a new documentation generation for{" "}
            <span className="font-medium text-white">
              {job?.repository.name ?? "this repository"}
            </span>{" "}
            from job{" "}
            <span className="font-mono text-white/80">
              {job ? formatJobId(job.id) : "—"}
            </span>
            . The previous run failed with the following error:
            {errorMessage ? (
              <span className="mt-2 block rounded-md border border-rose-500/20 bg-rose-500/[0.06] px-2.5 py-2 text-xs text-rose-400 break-words">
                {errorMessage}
              </span>
            ) : (
              <span className="mt-2 block text-xs text-white/50">
                No error details available.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="cursor-pointer" disabled={isRetrying}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isRetrying}
            className="cursor-pointer rounded-md bg-amber-600 font-mono text-xs uppercase tracking-wider text-white hover:bg-amber-700"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry job"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
