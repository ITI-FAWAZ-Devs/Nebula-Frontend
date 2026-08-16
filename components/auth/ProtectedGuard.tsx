"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMeQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store";

export function ProtectedGuard({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "USER" | "ADMIN";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading } = useMeQuery();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // If auth initialization has completed and user is null
    if (!user) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("redirect", pathname);
      router.replace(loginUrl.pathname + loginUrl.search);
      return;
    }

    // If a role is required and the user does not hold it, bounce to the app
    if (requireRole && user.role !== requireRole) {
      router.replace("/");
    }
  }, [isInitialized, user, isLoading, pathname, router, requireRole]);

  // Show a clean loader while verifying the session
  if (!isInitialized || isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090E]">
        <div className="relative flex flex-col items-center gap-6 z-10">

          {/* Simple clean spinner */}
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-primary animate-spin" />

          <div className="flex flex-col items-center gap-1 font-mono text-center">
            <div className="text-xs uppercase tracking-widest text-white/60 font-medium">
              Authenticating Session
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If session initialized and user exists (and holds the required role), render the actual page
  if (user && (!requireRole || user.role === requireRole)) {
    return <>{children}</>;
  }

  // Fallback: render nothing while redirecting
  return null;
}
