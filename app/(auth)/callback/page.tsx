"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useMeQuery } from "@/hooks/use-auth";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

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
          toast.success("Successfully logged in via OAuth!");
          const redirect = searchParams.get("redirect") || "/";
          router.replace(redirect);
        } else {
          toast.error("Session verification failed. Please login manually.");
          router.replace("/login");
        }
      });
    } else {
      toast.error("OAuth token payload missing. Please login manually.");
      router.replace("/login");
    }
  }, [accessToken, setAccessToken, refetch, router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background nebula-bg font-mono text-center p-6">
      <div className="relative flex flex-col items-center gap-6">
        {/* Sleek rotating status indicators */}
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
              background: "#4493F8",
              boxShadow: "0 0 20px #4493F8cc",
            }}
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="text-xs uppercase tracking-[0.3em] text-primary/80 animate-pulse">
            Finalizing OAuth Handshake
          </div>
          <div className="text-[10px] text-white/40">
            HYDRATING SECURE SESSION CONTEXT...
          </div>
        </div>
      </div>
    </div>
  );
}
