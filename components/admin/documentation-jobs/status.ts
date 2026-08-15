import type { AdminDocumentationJobStatus } from "@/hooks/use-admin";
import {
  documentationJobStatusStyles,
  type RepositoryStatusStyle,
} from "../repositories/status";

export type { AdminDocumentationJobStatus };

export function getDocumentationJobStatusStyle(
  status: AdminDocumentationJobStatus
): RepositoryStatusStyle {
  return documentationJobStatusStyles[status];
}

export function isTerminalDocumentationJobStatus(
  status: AdminDocumentationJobStatus
): boolean {
  return status === "COMPLETED" || status === "FAILED";
}

export function isFailedDocumentationJobStatus(
  status: AdminDocumentationJobStatus
): boolean {
  return status === "FAILED";
}
