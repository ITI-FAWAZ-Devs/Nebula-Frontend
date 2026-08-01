import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export interface GithubTokenStatus {
  hasToken: boolean;
  scopes?: string[];
  lastValidatedAt?: string;
}

// Hook: Get GitHub PAT status
export function useGithubTokenStatusQuery() {
  return useQuery({
    queryKey: ["github-token-status"],
    queryFn: async () => {
      const response = await api.get("/api/integrations/github/token/status");
      return response.data.data as GithubTokenStatus;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook: Save / Update GitHub PAT
export function useSaveGithubTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post("/api/integrations/github/token", { token });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-token-status"] });
      queryClient.invalidateQueries({ queryKey: ["github-repos"] });
    },
  });
}

// Hook: Remove stored GitHub PAT
export function useRemoveGithubTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete("/api/integrations/github/token");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-token-status"] });
      queryClient.invalidateQueries({ queryKey: ["github-repos"] });
    },
  });
}
