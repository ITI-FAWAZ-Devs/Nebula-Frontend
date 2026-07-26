"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMeQuery } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";

export function ProtectedGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isError } = useMeQuery();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // If auth initialization has completed and user is null
    if (isInitialized && !user && !isLoading) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("redirect", pathname);
      router.replace(loginUrl.pathname + loginUrl.search);
    }
  }, [isInitialized, user, isLoading, pathname, router]);

  // Show a sleek, premium Nebula loader while verifying the session
  if (!isInitialized || isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background nebula-bg">
        {/* Glow backdrop */}
        <div
          className="absolute h-[60vmin] w-[60vmin] rounded-full opacity-60"
          style={{
            background:
              "#4493F820",
            filter: "blur(40px)",
          }}
        />
        
        <div className="relative flex flex-col items-center gap-6 z-10">
          {/* Glowing central orb */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute h-10 w-10 rounded-full border border-primary/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute h-14 w-14 rounded-full border border-dashed border-primary/20 animate-spin-reverse-slow"
            />
            <div
              className="h-5 w-5 rounded-full bg-white glow-blue"
              style={{
                background:
                  "#4493F8",
                boxShadow: "0 0 16px #4493F8e6",
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 font-mono text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-primary/80 animate-pulse">
              Authenticating Secure Session
            </div>
            <div className="text-[10px] text-white/40">
              CONNECTING TO NEBULA OS COMMAND CENTER...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If session initialized and user exists, render the actual page
  if (user) {
    return <>{children}</>;
  }

  // Fallback: render nothing while redirecting
  return null;
}
