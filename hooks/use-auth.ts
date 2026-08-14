import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { useAuthStore, useWorkspaceStore, User } from "@/lib/store";

// Hook: Get Current Authenticated User profile
export function useMeQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/auth/me");
        const user = response.data.data as User;
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setInitialized(true);
        return user;
      } catch (error) {
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setInitialized(true);
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache before stale
  });
}

// Hook: Register via invite token (sets name + password, no email required)
export function useRegisterFromInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      inviteToken: string;
      fullName: string;
      password: string;
    }) => {
      const response = await api.post("/api/auth/register-from-invite", payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        useAuthStore.getState().setUser(data.user);
        queryClient.setQueryData(["me"], data.user);
        useWorkspaceStore.getState().setWorkspace({ type: "personal" });
      }
    },
  });
}

// Hook: Register new user account
export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      fullName?: string;
    }) => {
      const response = await api.post("/api/auth/register", payload);
      return response.data;
    },
  });
}

// Hook: Login with email and password
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await api.post("/api/auth/login", payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data;
      useAuthStore.getState().setAuth(user, accessToken);
      queryClient.setQueryData(["me"], user);
      // Always enter the app in the personal workspace
      useWorkspaceStore.getState().setWorkspace({ type: "personal" });
    },
  });
}

// Hook: Verify email address
export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: async (payload: { token: string }) => {
      const response = await api.post("/api/auth/verify-email", payload);
      return response.data;
    },
  });
}

// Hook: Request password reset link
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await api.post("/api/auth/forgot-password", payload);
      return response.data;
    },
  });
}

// Hook: Reset password using email token
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      const response = await api.post("/api/auth/reset-password", payload);
      return response.data;
    },
  });
}

// Hook: Change password for active user session
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await api.post("/api/auth/change-password", payload);
      return response.data;
    },
  });
}

// Hook: Logout active session
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      // Clear Zustand client state
      useAuthStore.getState().clearAuth();
      useWorkspaceStore.getState().setWorkspace({ type: "personal" });
      // Remove query cache details for all queries
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
    },
    onError: () => {
      // Fallback: clear client session anyway on logout issues
      useAuthStore.getState().clearAuth();
      useWorkspaceStore.getState().setWorkspace({ type: "personal" });
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
    },
  });
}
