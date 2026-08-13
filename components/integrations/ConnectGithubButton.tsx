"use client";

import { FiGithub } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore, useAuthStore } from "@/lib/store";

interface ConnectGithubButtonProps {
  organizationId?: string | null;
  className?: string;
  size?: "sm" | "md";
  label?: string;
  /** Path to redirect back to after the connect flow completes (defaults to /launch). */
  returnTo?: string;
}

/**
 * Initiates the GitHub OAuth connect flow using the SAME registered callback
 * URL as the login flow (/auth/github/callback). The purpose is distinguished
 * via the `state` query parameter so no second callback URL needs to be
 * registered with the GitHub OAuth App.
 *
 * State shape: { purpose: 'connect', userId, workspace, organizationId }
 */
export function ConnectGithubButton({
  organizationId,
  className,
  size = "md",
  label = "Connect with GitHub",
  returnTo,
}: ConnectGithubButtonProps) {
  const { workspace } = useWorkspaceStore();
  const user = useAuthStore((s) => s.user);

  const handleConnect = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const workspaceType = organizationId ? "organization" : workspace.type;
    const orgId = organizationId ?? (workspace.type === "organization" ? workspace.organizationId : null);

    const statePayload = {
      purpose: "connect",
      userId: user?.id ?? null,
      workspace: workspaceType,
      organizationId: orgId ?? null,
      returnTo: returnTo ?? null,
    };

    const stateB64 = btoa(JSON.stringify(statePayload));
    window.location.href = `${backendUrl}/api/auth/github/connect?state=${encodeURIComponent(stateB64)}`;
  };

  return (
    <Button
      type="button"
      onClick={handleConnect}
      className={className}
      size={size === "sm" ? "sm" : "default"}
    >
      <FiGithub className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
