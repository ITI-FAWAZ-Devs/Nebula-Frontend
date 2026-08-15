"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, useWorkspaceStore } from "@/lib/store";
import { useMeQuery } from "@/hooks/use-auth";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";
import { toast } from "sonner";
import { motion } from "motion/react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

  const accessToken = searchParams.get("accessToken");
  const runOnce = useRef(false);

  const { refetch } = useMeQuery();

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;

    if (accessToken) {
      // 1. Hydrate the Zustand store with the backup accessToken
      setAccessToken(accessToken);

      // 2. Refresh the ['me'] query to retrieve profile details
      refetch().then((result) => {
        if (result.data) {
          setWorkspace({ type: "personal" });
          toast.success("Successfully logged in via OAuth!");
          router.replace("/launch");
          const requestedPath =
            searchParams.get("redirect_to") ?? searchParams.get("redirect");
          router.replace(resolvePostLoginRedirect(result.data, requestedPath));
        } else {
          toast.error("Session verification failed. Please login manually.");
          router.replace("/login");
        }
      });
    } else {
      toast.error("OAuth token payload missing. Please login manually.");
      router.replace("/login");
    }
  }, [accessToken, setAccessToken, setWorkspace, refetch, router]);

  return (
    <AuthCard>
      <div className="py-6 flex flex-col items-center justify-center text-center">
        {/* Sleek rotating status indicators */}
        <div className="relative flex items-center justify-center h-20 mb-6">
          <motion.div
            className="absolute h-14 w-14 rounded-full border-2 border-primary/30 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="h-5 w-5 rounded-full bg-primary shadow-[0_0_20px_rgba(68,147,248,0.9)] animate-pulse"
          />
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold animate-pulse">
            Finalizing OAuth Handshake
          </div>
          <div className="text-[10px] text-white/40">
            HYDRATING SECURE SESSION CONTEXT...
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
