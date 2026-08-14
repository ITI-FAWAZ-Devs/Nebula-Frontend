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
  userId: string | null;
  inviteEmail?: string | null;
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
  } | null;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export const PERMISSION_CATALOG = [
  { id: "repo.read", label: "View Repositories", description: "View repositories, metadata, and architecture docs" },
  { id: "repo.ask", label: "Ask / Voice Agent", description: "Use the RAG agent and voice agent on repos" },
  { id: "repo.process", label: "Process / Import", description: "Import, analyze, and generate docs for repos" },
  { id: "repo.update", label: "Edit Repository", description: "Update repository settings and metadata" },
  { id: "repo.delete", label: "Delete Repository", description: "Remove repos from the organization" },
  { id: "repo.settings", label: "Repository Settings", description: "Manage repository-level configuration" },
  { id: "repo.manage_access", label: "Manage Repo Access", description: "Set per-member and per-team repo permissions" },
  { id: "org.invite", label: "Invite Members", description: "Send invitations to join the organization" },
  { id: "org.manage_roles", label: "Manage Roles", description: "Create, edit, and delete roles; reassign members" },
  { id: "org.manage_settings", label: "Org Settings", description: "Update organization name and configuration" },
  { id: "org.manage_integrations", label: "Manage Integrations", description: "Configure integrations and third-party services" },
  { id: "org.billing", label: "Billing", description: "View and manage billing and subscription (Owner only)" },
  { id: "org.delete", label: "Delete Organization", description: "Permanently delete the organization (Owner only)" },
  { id: "team.manage", label: "Manage Teams", description: "Create, edit, delete teams; add/remove members and repos" },
  { id: "connection.manage", label: "Manage Connections", description: "Add and remove GitHub OAuth connections" },
  { id: "audit.read", label: "View Audit Logs", description: "Read the organization's audit log" },
] as const;

export type Permission = (typeof PERMISSION_CATALOG)[number]["id"];

/** Client-side permission check against a permission array. */
export function can(permissions: string[] | null | undefined, action: Permission): boolean {
  if (!permissions) return false;
  return permissions.includes(action);
}

export interface TeamMember {
  id: string;
  userId: string;
  user: { id: string; email: string; fullName?: string | null; avatar?: string | null };
}

export interface TeamRepository {
  id: string;
  repositoryId: string;
  permissions: string[];
  repository: { id: string; name: string; owner: string };
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  repositories?: TeamRepository[];
  _count?: { members: number; repositories: number };
}

export interface AuditLog {
  id: string;
  actorId: string;
  orgId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; email: string; fullName?: string | null; avatar?: string | null };
}

export interface GitHubConnection {
  id: string;
  label: string | null;
  providerAccountLogin: string | null;
  providerAccountId: string | null;
  providerAccountType: "USER" | "ORGANIZATION" | null;
  isValid: boolean;
  credentialType: string;
  createdAt: string;
}

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

// Hook: Delete Organization
export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// Hook: Rename Organization
export function useRenameOrganizationMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.patch(`/api/organizations/${orgId}`, { name });
      return response.data.data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgId] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// ── Teams ──────────────────────────────────────────────────────────────────

export function useOrgTeamsQuery(orgId: string | null) {
  return useQuery({
    queryKey: ["org-teams", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/api/organizations/${orgId}/teams`);
      return response.data.data as Team[];
    },
    enabled: !!orgId,
  });
}

export function useCreateOrgTeamMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post(`/api/organizations/${orgId}/teams`, { name });
      return response.data.data as Team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-teams", orgId] });
    },
  });
}

export function useDeleteOrgTeamMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/teams/${teamId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-teams", orgId] });
    },
  });
}

export function useAddTeamMemberMutation(orgId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/api/organizations/${orgId}/teams/${teamId}/members`, { userId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-teams", orgId] });
    },
  });
}

export function useRemoveTeamMemberMutation(orgId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/teams/${teamId}/members/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-teams", orgId] });
    },
  });
}

export function useAddTeamRepositoryMutation(orgId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await api.post(`/api/organizations/${orgId}/teams/${teamId}/repositories`, { repositoryId, permissions: [] });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-teams", orgId] });
    },
  });
}

export function useRemoveTeamRepositoryMutation(orgId: string, teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/teams/${teamId}/repositories/${repositoryId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-teams", orgId] });
    },
  });
}

// ── Repository Member Access ──────────────────────────────────────────────

export function useRepoMembersQuery(orgId: string | null, repoId: string | null) {
  return useQuery({
    queryKey: ["repo-members", orgId, repoId],
    queryFn: async () => {
      if (!orgId || !repoId) return [];
      const response = await api.get(`/api/organizations/${orgId}/repositories/${repoId}/members`);
      return response.data.data as Array<{
        id: string;
        repositoryId: string;
        userId: string;
        permissions: string[];
        user: { id: string; email: string; fullName?: string | null; avatar?: string | null };
      }>;
    },
    enabled: !!orgId && !!repoId,
  });
}

export function useSetRepoMemberMutation(orgId: string, repoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; permissions: string[] }) => {
      const response = await api.post(`/api/organizations/${orgId}/repositories/${repoId}/members`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repo-members", orgId, repoId] });
    },
  });
}

export function useRemoveRepoMemberMutation(orgId: string, repoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/repositories/${repoId}/members/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repo-members", orgId, repoId] });
    },
  });
}

// ── Audit Logs ────────────────────────────────────────────────────────────

export function useOrgAuditLogsQuery(orgId: string | null, limit = 50) {
  return useQuery({
    queryKey: ["org-audit-logs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/api/organizations/${orgId}/audit-logs?limit=${limit}`);
      return response.data.data as AuditLog[];
    },
    enabled: !!orgId,
  });
}

// ── Org Connections (GitHub OAuth) ────────────────────────────────────────

export function useOrgConnectionsQuery(orgId: string | null) {
  return useQuery({
    queryKey: ["org-connections", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await api.get(`/api/organizations/${orgId}/connections`);
      return response.data.data as GitHubConnection[];
    },
    enabled: !!orgId,
  });
}

export function useDeleteOrgConnectionMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connId: string) => {
      const response = await api.delete(`/api/organizations/${orgId}/connections/${connId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-connections", orgId] });
    },
  });
}

export function useUserConnectionsQuery() {
  return useQuery({
    queryKey: ["user-connections"],
    queryFn: async () => {
      const response = await api.get("/api/connections");
      return response.data.data as GitHubConnection[];
    },
  });
}

export function useDeleteUserConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connId: string) => {
      const response = await api.delete(`/api/connections/${connId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
    },
  });
}

// Hook: Save GitHub OAuth connection selections
export function useSaveGithubConnectionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      accessToken: string;
      userId?: string;
      selections: Array<{ login: string; id: string; type: "USER" | "ORGANIZATION" }>;
      workspace: "personal" | "organization";
      organizationId?: string | null;
    }) => {
      const response = await api.post("/api/auth/github/connect/select", payload);
      return response.data;
    },
    onSuccess: (_, vars) => {
      if (vars.workspace === "organization" && vars.organizationId) {
        queryClient.invalidateQueries({ queryKey: ["org-connections", vars.organizationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user-connections"] });
      }
    },
  });
}
