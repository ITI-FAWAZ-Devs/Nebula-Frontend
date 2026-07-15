import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string | null;
  isEmailVerified: boolean;
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
