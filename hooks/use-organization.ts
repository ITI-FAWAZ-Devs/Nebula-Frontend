import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type MemberStatus = "PENDING" | "ACTIVE";

export interface Role {
  id: string;
  orgId: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  _count?: { members: number };
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  userRole?: Role;
  roles?: Role[];
}

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  roleId: string;
  status: MemberStatus;
  inviteToken?: string | null;
  invitedBy?: string | null;
  joinedAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatar?: string | null;
  };
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export const PERMISSION_CATALOG = [
  { id: "repo:read", label: "Repository Read", description: "View repositories and metadata" },
  { id: "repo:import", label: "Repository Import", description: "Import GitHub repositories into org" },
  { id: "docs:read", label: "Docs Read", description: "Read architecture documents and RAG answers" },
  { id: "docs:write", label: "Docs Write", description: "Generate and edit architecture documents" },
  { id: "task:read", label: "Task Read", description: "View organization tasks and background jobs" },
  { id: "task:write", label: "Task Write", description: "Create and update tasks and pipeline triggers" },
  { id: "member:invite", label: "Member Invite", description: "Invite new members to the organization" },
  { id: "org:manage", label: "Organization Manage", description: "Manage roles, settings, and member permissions" },
] as const;

// Hook: List user's organizations
export function useOrganizationsQuery() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.get("/api/organizations");
      return response.data.data as Organization[];
    },
  });
}

// Hook: List repositories belonging to an organization
export function useOrgRepositoriesQuery(orgId: string | null) {
  return useQuery({
    queryKey: ["org-repositories", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/api/organizations/${orgId}/repositories`);
      return response.data.data as Array<{
        id: string;
        githubRepoId: string;
        name: string;
        owner: string;
        defaultBranch: string;
        isPrivate: boolean;
        cloneUrl: string;
        status: string;
        userId: string;
        organizationId: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
    },
    enabled: !!orgId,
  });
}

// Hook: Get organization detail by ID
export function useOrganizationQuery(orgId: string | null) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const response = await api.get(`/api/organizations/${orgId}`);
      return response.data.data as Organization;
    },
    enabled: !!orgId,
  });
}

// Hook: Create Organization
export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const response = await api.post("/api/organizations", payload);
      return response.data.data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// Hook: List Roles for an Organization
export function useOrgRolesQuery(orgId: string | null) {
  return useQuery({
    queryKey: ["org-roles", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/api/organizations/${orgId}/roles`);
      return response.data.data as Role[];
    },
    enabled: !!orgId,
  });
}

// Hook: Create Role
export function useCreateOrgRoleMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; permissions: string[] }) => {
      const response = await api.post(`/api/organizations/${orgId}/roles`, payload);
      return response.data.data as Role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-roles", orgId] });
      queryClient.invalidateQueries({ queryKey: ["organization", orgId] });
    },
  });
}

// Hook: Update Role
export function useUpdateOrgRoleMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, name, permissions }: { roleId: string; name?: string; permissions?: string[] }) => {
      const response = await api.patch(`/api/organizations/${orgId}/roles/${roleId}`, { name, permissions });
      return response.data.data as Role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-roles", orgId] });
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
    },
  });
}

// Hook: Delete Role
export function useDeleteOrgRoleMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/roles/${roleId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-roles", orgId] });
    },
  });
}

// Hook: List Members for an Organization
export function useOrgMembersQuery(orgId: string | null) {
  return useQuery({
    queryKey: ["org-members", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/api/organizations/${orgId}/members`);
      return response.data.data as OrganizationMember[];
    },
    enabled: !!orgId,
  });
}

// Hook: Invite Member
export function useInviteOrgMemberMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; roleId: string }) => {
      const response = await api.post(`/api/organizations/${orgId}/members/invite`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      queryClient.invalidateQueries({ queryKey: ["organization", orgId] });
    },
  });
}

// Hook: Accept Invite
export function useAcceptOrgInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/api/organizations/invites/${token}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// Hook: Change Member Role
export function useChangeOrgMemberRoleMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, roleId }: { memberId: string; roleId: string }) => {
      const response = await api.patch(`/api/organizations/${orgId}/members/${memberId}`, { roleId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
    },
  });
}

// Hook: Remove Member
export function useRemoveOrgMemberMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/members/${memberId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      queryClient.invalidateQueries({ queryKey: ["organization", orgId] });
    },
  });
}
