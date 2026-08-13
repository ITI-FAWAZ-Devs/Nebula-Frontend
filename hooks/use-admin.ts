import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalImportedRepositories: number;
  totalDocumentationJobs: number;
  successfulDocumentationJobs: number;
  failedDocumentationJobs: number;
}

export type AdminUserRole = "USER" | "ADMIN";
export type AdminSubscriptionTier = "FREE" | "PRO" | "ULTRA";

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  role: AdminUserRole;
  isEmailVerified: boolean;
  subscriptionTier: AdminSubscriptionTier;
  githubConnected: boolean;
  repositoriesCount: number;
  usageLogsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccountSummary {
  provider: string;
  providerUsername: string | null;
  providerAvatar: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  totalGenerationsUsed: number;
  generationsUsedThisPeriod: number;
  organizationsCount: number;
  ownedOrganizationsCount: number;
  lastUsageAt: string | null;
  accounts: AdminAccountSummary[];
}

export interface AdminUsersResponse {
  items: AdminUserSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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

export interface AdminUsersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: AdminUserRole;
}

export function useAdminUsersQuery(params: AdminUsersQueryParams = {}) {
  const { page, pageSize, search, role } = params;
  return useQuery({
    queryKey: ["admin", "users", page, pageSize, search, role],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<AdminUsersResponse>>(
        "/api/admin/users",
        {
          params: {
            page,
            pageSize,
            ...(search ? { search } : {}),
            ...(role ? { role } : {}),
          },
        }
      );
      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAdminUserQuery(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "users", userId, "detail"],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<AdminUserDetail>>(
        `/api/admin/users/${userId}`
      );
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
  });
}
