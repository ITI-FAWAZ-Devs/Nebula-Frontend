import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalImportedRepositories: number;
  totalDocumentationJobs: number;
  successfulDocumentationJobs: number;
  failedDocumentationJobs: number;
}

interface AdminApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<DashboardStats>>(
        "/api/admin/dashboard/stats"
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
