"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMeQuery } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Initiates user fetch and populates Zustand client state on app boot
  useMeQuery();
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
      <Toaster closeButton position="top-right" />
    </QueryClientProvider>
  );
}
