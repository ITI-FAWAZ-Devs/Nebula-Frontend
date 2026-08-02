import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type ArchDocStatus =
  | "PENDING"
  | "RETRIEVING"
  | "GENERATING"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED";

export const ACTIVE_ARCH_DOC_STATUSES: ArchDocStatus[] = [
  "PENDING",
  "RETRIEVING",
  "GENERATING",
  "VERIFYING",
];

export function isActiveArchDocStatus(status: string): boolean {
  return (ACTIVE_ARCH_DOC_STATUSES as string[]).includes(status);
}

export interface ArchDocSection {
  key: string;
  title: string;
  order: number;
  contentMd: string;
  sourceFiles: string[];
  diagramMermaid: string | null;
  verified: boolean;
  verificationNotes: string | null;
}

export interface ArchDocData {
  docId: string;
  version: number;
  status: ArchDocStatus;
  commitSha: string | null;
  generatedAt: string | null;
  verificationScore: number | null;
  sections: ArchDocSection[];
}

export interface ArchDocVersionSummary {
  docId: string;
  version: number;
  status: ArchDocStatus;
  generatedAt: string | null;
  verificationScore: number | null;
}

export interface ArchDocStatusEntry {
  repositoryId: string;
  hasDoc: boolean;
  version: number | null;
  commitSha: string | null;
}

export type RegenerateResponse =
  | {
      needsRegeneration: true;
      docId: string;
      jobId: string;
      version: number;
      status: ArchDocStatus;
    }
  | {
      needsRegeneration: false;
      currentCommitSha: string;
      latestVersion: number;
    };

// Batch: whether each owned repository already has a completed architecture document
export function useArchDocStatusQuery() {
  return useQuery({
    queryKey: ["arch-doc-status"],
    queryFn: async () => {
      const response = await api.get("/api/repositories/architecture-doc/status");
      return response.data.data as ArchDocStatusEntry[];
    },
    staleTime: 30 * 1000,
  });
}

// Version history for one repository; auto-polls while a version is in flight
export function useArchDocVersionsQuery(repositoryId: string | null) {
  return useQuery({
    queryKey: ["arch-doc-versions", repositoryId],
    queryFn: async () => {
      const response = await api.get(
        `/api/repositories/${repositoryId}/architecture-doc/versions`
      );
      return response.data.data as ArchDocVersionSummary[];
    },
    enabled: !!repositoryId,
    refetchInterval: (query) => {
      const versions = query.state.data as ArchDocVersionSummary[] | undefined;
      return versions?.some((v) => isActiveArchDocStatus(v.status)) ? 2500 : false;
    },
  });
}

// Full document content for a specific version
export function useArchDocVersionQuery(
  repositoryId: string | null,
  version: number | null
) {
  return useQuery({
    queryKey: ["arch-doc-version", repositoryId, version],
    queryFn: async () => {
      const response = await api.get(
        `/api/repositories/${repositoryId}/architecture-doc/versions/${version}`
      );
      return response.data.data as ArchDocData;
    },
    enabled: !!repositoryId && version !== null && version !== undefined,
    retry: false,
  });
}

// Trigger regeneration against the live GitHub HEAD commit
export function useRegenerateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await api.post(
        `/api/repositories/${repositoryId}/architecture-doc/regenerate`
      );
      return response.data.data as RegenerateResponse;
    },
    onSuccess: (data, repositoryId) => {
      queryClient.invalidateQueries({ queryKey: ["arch-doc-versions", repositoryId] });
      queryClient.invalidateQueries({ queryKey: ["arch-doc-version", repositoryId] });
      queryClient.invalidateQueries({ queryKey: ["arch-doc", repositoryId] });
      queryClient.invalidateQueries({ queryKey: ["arch-doc-status"] });
    },
  });
}
