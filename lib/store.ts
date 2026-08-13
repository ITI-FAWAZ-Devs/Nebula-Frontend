import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string | null;
  isEmailVerified: boolean;
  defaultWorkspaceType?: "PERSONAL" | "ORGANIZATION";
  defaultOrganizationId?: string | null;
  role?: "USER" | "ADMIN";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isInitialized: true }),
  clearAuth: () => set({ user: null, accessToken: null, isInitialized: true }),
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}));

// ── Workspace Context Store ────────────────────────────────────────────────

export type WorkspaceContext =
  | { type: "personal" }
  | { type: "organization"; organizationId: string; organizationName?: string };

interface WorkspaceState {
  workspace: WorkspaceContext;
  setWorkspace: (ctx: WorkspaceContext) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspace: { type: "personal" },
      setWorkspace: (workspace) => set({ workspace }),
    }),
    {
      name: "nebula-workspace",
    },
  ),
);

// ── UI chrome store ────────────────────────────────────────────────────────

interface UiState {
  importPickerOpen: boolean;
  setImportPickerOpen: (open: boolean) => void;
  createOrgOpen: boolean;
  setCreateOrgOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  importPickerOpen: false,
  setImportPickerOpen: (importPickerOpen) => set({ importPickerOpen }),
  createOrgOpen: false,
  setCreateOrgOpen: (createOrgOpen) => set({ createOrgOpen }),
}));
