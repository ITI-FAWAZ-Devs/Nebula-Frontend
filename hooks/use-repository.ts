import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type RepositoryStatus = "IMPORTED" | "CLONING" | "INDEXING" | "READY" | "FAILED";

export interface GitHubRepoDetails {
  githubRepoId: string;
  name: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  cloneUrl: string;
}

export interface Repository {
  id: string;
  githubRepoId: string;
  name: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  cloneUrl: string;
  localPath?: string | null;
  status: RepositoryStatus;
  lastIndexedCommit?: string | null;
  userId: string;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GithubReposResponse {
  repositories: GitHubRepoDetails[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Hook: Get live GitHub repositories, optionally scoped to a specific connectionId
export function useGithubReposQuery(params?: {
  page?: number;
  limit?: number;
  force?: boolean;
  connectionId?: string;
  organizationId?: string | null;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["github-repos", params?.connectionId ?? "all", params?.organizationId ?? "personal"],
    queryFn: async () => {
      const response = await api.get("/api/repositories/github", {
        params: {
          page: params?.page,
          limit: params?.limit,
          force: params?.force ? "true" : "false",
          connectionId: params?.connectionId,
          organizationId: params?.organizationId ?? undefined,
        },
      });
      return response.data.data as GithubReposResponse;
    },
    enabled: params?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook: Get list of imported repositories in Nebula DB (workspace-scoped)
export function useImportedReposQuery(organizationId?: string | null) {
  return useQuery({
    queryKey: ["imported-repos", organizationId ?? "personal"],
    queryFn: async () => {
      if (organizationId) {
        const response = await api.get(`/api/organizations/${organizationId}/repositories`);
        return response.data.data as Repository[];
      }
      const response = await api.get("/api/repositories");
      return response.data.data as Repository[];
    },
  });
}

// Hook: Get detailed metadata for a single imported repository
export function useRepositoryQuery(id: string | null) {
  return useQuery({
    queryKey: ["repository", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/api/repositories/${id}`);
      return response.data.data as Repository;
    },
    enabled: !!id,
  });
}

// Hook: Import a repository from GitHub to Nebula
export function useImportRepoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GitHubRepoDetails) => {
      const response = await api.post("/api/repositories/import", payload);
      return response.data.data as Repository;
    },
    onSuccess: () => {
      // Invalidate the imported repos list to trigger visual updates
      queryClient.invalidateQueries({ queryKey: ["imported-repos"] });
    },
  });
}

// Hook: Delete/remove an imported repository from database
export function useDeleteRepoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/repositories/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate list query and detail query
      queryClient.invalidateQueries({ queryKey: ["imported-repos"] });
      queryClient.invalidateQueries({ queryKey: ["org-repositories"] });
      queryClient.invalidateQueries({ queryKey: ["repository", id] });
    },
  });
}

// Hook: Import repository by public or private URL/shorthand
export function useImportRepoFromUrlMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { url: string; organizationId?: string; connectionId?: string }) => {
      const response = await api.post("/api/repositories/import-url", payload);
      return response.data.data as Repository;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["imported-repos"] });
      if (data.organizationId) {
        queryClient.invalidateQueries({ queryKey: ["org-repositories", data.organizationId] });
      }
    },
  });
}
