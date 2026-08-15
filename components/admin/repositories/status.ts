import type {
  AdminDocumentationJobStatus,
  AdminDocumentationStatus,
  AdminDocStatus,
  AdminRepositoryStatus,
} from "@/hooks/use-admin";

const ACTIVE_DOC_STATUSES: AdminDocStatus[] = [
  "PENDING",
  "RETRIEVING",
  "GENERATING",
  "VERIFYING",
];

export interface RepositoryStatusStyle {
  label: string;
  className: string;
}

export const repositoryStatusStyles: Record<
  AdminRepositoryStatus,
  RepositoryStatusStyle
> = {
  IMPORTED: {
    label: "Imported",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  CLONING: {
    label: "Cloning",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  INDEXING: {
    label: "Indexing",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  READY: {
    label: "Ready",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
};

export const documentationStatusStyles: Record<
  AdminDocumentationStatus,
  RepositoryStatusStyle
> = {
  NOT_GENERATED: { label: "Not generated", className: "" },
  PENDING: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  RETRIEVING: {
    label: "Retrieving",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  GENERATING: {
    label: "Generating",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  VERIFYING: {
    label: "Verifying",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
};

export const documentationJobStatusStyles: Record<
  AdminDocumentationJobStatus,
  RepositoryStatusStyle
> = {
  PENDING: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  RUNNING: {
    label: "Running",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
};

export function isActiveDocStatus(status: AdminDocumentationStatus): boolean {
  return ACTIVE_DOC_STATUSES.includes(status as AdminDocStatus);
}
