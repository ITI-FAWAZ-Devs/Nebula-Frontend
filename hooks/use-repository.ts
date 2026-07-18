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

// Hook: Get live user GitHub repositories
export function useGithubReposQuery(params?: {
  page?: number;
  limit?: number;
  force?: boolean;
}) {
  return useQuery({
    queryKey: ["github-repos", params],
    queryFn: async () => {
      const response = await api.get("/api/repositories/github", {
        params: {
          page: params?.page,
          limit: params?.limit,
          force: params?.force ? "true" : "false",
        },
      });
      return response.data.data as GithubReposResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook: Get list of imported repositories in Nebula DB
export function useImportedReposQuery() {
  return useQuery({
    queryKey: ["imported-repos"],
    queryFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ["repository", id] });
    },
  });
}
