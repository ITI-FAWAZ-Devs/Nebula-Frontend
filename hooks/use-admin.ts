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

export function useUpdateAdminUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AdminUserRole;
    }) => {
      const response = await api.patch<AdminApiResponse<AdminUserSummary>>(
        `/api/admin/users/${userId}/role`,
        { role }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export type AdminRepositoryStatus =
  | "IMPORTED"
  | "CLONING"
  | "INDEXING"
  | "READY"
  | "FAILED";

export type AdminDocStatus =
  | "PENDING"
  | "RETRIEVING"
  | "GENERATING"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED";

export type AdminDocumentationStatus = AdminDocStatus | "NOT_GENERATED";

export type AdminDocumentationJobStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface AdminRepositoryOwnerUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatar: string | null;
}

export interface AdminRepositorySummary {
  id: string;
  name: string;
  githubUrl: string;
  owner: string;
  isPrivate: boolean;
  user: AdminRepositoryOwnerUser;
  importDate: string;
  repositoryStatus: AdminRepositoryStatus;
  documentationStatus: AdminDocumentationStatus;
  lastDocumentationGeneration: string | null;
  lastArchDocGeneratedAt: string | null;
}

export interface AdminRepositoriesResponse {
  items: AdminRepositorySummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminRepositoryOrganization {
  id: string;
  name: string;
}

export interface AdminRepositoryDocumentationJob {
  id: string;
  status: AdminDocumentationJobStatus;
  stage: string | null;
  progress: number | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface AdminRepositoryGeneratedDocVersion {
  id: string;
  version: number;
  status: AdminDocStatus;
  commitSha: string | null;
  generatedAt: string | null;
  verificationScore: number | null;
  triggeredByUserId: string | null;
  createdAt: string;
}

export interface AdminRepositoryDetail {
  id: string;
  name: string;
  githubUrl: string;
  githubRepoId: string | null;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  user: AdminRepositoryOwnerUser;
  organization: AdminRepositoryOrganization | null;
  repositoryStatus: AdminRepositoryStatus;
  documentationStatus: AdminDocumentationStatus;
  importDate: string;
  lastDocumentationGeneration: string | null;
  lastIndexedCommit: string | null;
  documentedCommit: string | null;
  latestDocumentationJob: AdminRepositoryDocumentationJob | null;
  latestGeneratedDoc: AdminRepositoryGeneratedDocVersion | null;
  generatedDocVersions: AdminRepositoryGeneratedDocVersion[];
  documentationJobsCount: number;
  analysisJobsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminRepositorySortBy =
  | "createdAt"
  | "name"
  | "updatedAt"
  | "lastDocumentedAt";

export type AdminRepositorySortOrder = "asc" | "desc";

export interface AdminRepositoriesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  repositoryStatus?: AdminRepositoryStatus;
  documentationStatus?: AdminDocumentationStatus;
  owner?: string;
  userId?: string;
  sortBy?: AdminRepositorySortBy;
  sortOrder?: AdminRepositorySortOrder;
}

export function useAdminRepositoriesQuery(
  params: AdminRepositoriesQueryParams = {}
) {
  const {
    page,
    pageSize,
    search,
    repositoryStatus,
    documentationStatus,
    owner,
    userId,
    sortBy,
    sortOrder,
  } = params;
  return useQuery({
    queryKey: [
      "admin",
      "repositories",
      page,
      pageSize,
      search,
      repositoryStatus,
      documentationStatus,
      owner,
      userId,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<AdminRepositoriesResponse>>(
        "/api/admin/repositories",
        {
          params: {
            page,
            pageSize,
            ...(search ? { search } : {}),
            ...(repositoryStatus ? { repositoryStatus } : {}),
            ...(documentationStatus ? { documentationStatus } : {}),
            ...(owner ? { owner } : {}),
            ...(userId ? { userId } : {}),
            ...(sortBy ? { sortBy } : {}),
            ...(sortOrder ? { sortOrder } : {}),
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

export function useAdminRepositoryQuery(repositoryId: string | null) {
  return useQuery({
    queryKey: ["admin", "repositories", repositoryId, "detail"],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<AdminRepositoryDetail>>(
        `/api/admin/repositories/${repositoryId}`
      );
      return response.data.data;
    },
    enabled: !!repositoryId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useDeleteAdminRepositoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await api.delete(
        `/api/admin/repositories/${repositoryId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "repositories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
  });
}

export interface AdminRegenerateDocumentationResult {
  needsRegeneration: boolean;
  docId?: string;
  jobId?: string;
  version?: number;
  status?: AdminDocStatus;
  currentCommitSha?: string;
  latestVersion?: number;
}

export function useRegenerateAdminDocumentationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await api.post<
        AdminApiResponse<AdminRegenerateDocumentationResult>
      >(`/api/admin/repositories/${repositoryId}/documentation/regenerate`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "repositories"] });
    },
  });
}

export interface AdminDocumentationJobRepository {
  id: string;
  name: string;
  owner: string;
  githubUrl: string;
  isPrivate: boolean;
}

export interface AdminDocumentationJobUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatar: string | null;
}

export interface AdminDocumentationJobSummary {
  id: string;
  status: AdminDocumentationJobStatus;
  stage: string | null;
  progress: number | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  repository: AdminDocumentationJobRepository;
  user: AdminDocumentationJobUser;
}

export interface AdminDocumentationJobDetail extends AdminDocumentationJobSummary {
  queueJobId: string | null;
  resumeCount: number;
}

export interface AdminDocumentationJobsResponse {
  items: AdminDocumentationJobSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminDocumentationJobsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: AdminDocumentationJobStatus;
}

export function useAdminDocumentationJobsQuery(
  params: AdminDocumentationJobsQueryParams = {}
) {
  const { page, pageSize, search, status } = params;
  return useQuery({
    queryKey: ["admin", "documentation-jobs", page, pageSize, search, status],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<AdminDocumentationJobsResponse>>(
        "/api/admin/documentation-jobs",
        {
          params: {
            page,
            pageSize,
            ...(search ? { search } : {}),
            ...(status ? { status } : {}),
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

export function useAdminDocumentationJobQuery(jobId: string | null) {
  return useQuery({
    queryKey: ["admin", "documentation-jobs", jobId, "detail"],
    queryFn: async () => {
      const response = await api.get<AdminApiResponse<AdminDocumentationJobDetail>>(
        `/api/admin/documentation-jobs/${jobId}`
      );
      return response.data.data;
    },
    enabled: !!jobId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useRetryAdminDocumentationJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post<
        AdminApiResponse<AdminDocumentationJobDetail>
      >(`/api/admin/documentation-jobs/${jobId}/retry`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "documentation-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
    },
  });
}
