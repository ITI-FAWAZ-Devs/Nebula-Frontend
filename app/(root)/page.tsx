"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NebulaLanding } from "@/components/landing/NebulaLanding";
import { useAuthStore, useWorkspaceStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  useEffect(() => {
    if (!isInitialized || !user) return;
    setWorkspace({ type: "personal" });
    router.replace("/launch");
  }, [isInitialized, user, router, setWorkspace]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-xs font-mono text-white/40">
        Opening hangar...
      </div>
    );
  }

  return <NebulaLanding />;
}
