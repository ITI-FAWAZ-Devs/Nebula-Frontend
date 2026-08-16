import axios from "axios";
import { useAuthStore } from "../lib/store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach in-memory access token as Bearer token
api.interceptors.request.use(
  (config) => {
    // Avoid reading Zustand store on server side context directly
    if (typeof window !== "undefined") {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle silent token refreshing on 401 Unauthorized
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard: ignore if no response, if status is not 401, or if we already retried this request
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    const apiMessage = error.response?.data?.message;
    const looksLikeGithubToken =
      (typeof apiMessage === "string" && /github token/i.test(apiMessage)) ||
      url.includes("/repositories/github");

    // Guard: ignore if it's an auth endpoint where 401 is expected (login, register, refresh itself)
    // or a GitHub-token failure (must not log the user out of Nebula).
    if (
      looksLikeGithubToken ||
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call the refresh endpoint (cookies will be attached automatically)
      const response = await api.post("/api/auth/refresh");
      const { accessToken, user } = response.data.data;

      // Update the Zustand store
      if (typeof window !== "undefined") {
        useAuthStore.getState().setAuth(user, accessToken);
      }

      processQueue(null, accessToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      if (typeof window !== "undefined") {
        useAuthStore.getState().clearAuth();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
