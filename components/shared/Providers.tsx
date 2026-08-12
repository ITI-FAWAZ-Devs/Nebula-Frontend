"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMeQuery } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/utils/api";
import { useAuthStore } from "@/lib/store";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Initiates user fetch and populates Zustand client state on app boot
  useMeQuery();

  // Proactively populate the in-memory access token so features that need
  // it directly (e.g., the voice WebSocket handshake) always find it.
  // POST /api/auth/refresh reads the HttpOnly refresh cookie and returns a
  // fresh access token without requiring user interaction.
  useEffect(() => {
    api
      .post("/api/auth/refresh")
      .then((r) => {
        const { accessToken } = r.data?.data ?? {};
        if (accessToken) {
          useAuthStore.getState().setAccessToken(accessToken);
        }
      })
      .catch(() => {
        // Not logged in or refresh token expired — let the normal auth
        // redirect flow handle it.
      });
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 mins stale
            refetchOnWindowFocus: false, // disable focus refetching
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
      <Toaster closeButton position="bottom-right" />
    </QueryClientProvider>
  );
}
