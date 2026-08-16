"use client";

import { FiGithub } from "react-icons/fi";
import { Building2, UserCircle2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useOrgConnectionsQuery, useDeleteOrgConnectionMutation, GitHubConnection } from "@/hooks/use-organization";
import { ConnectGithubButton } from "@/components/integrations/ConnectGithubButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectionsTabProps {
  orgId: string;
  canManage: boolean;
}

export function ConnectionsTab({ orgId, canManage }: ConnectionsTabProps) {
  const { data: connections, isLoading } = useOrgConnectionsQuery(orgId);
  const deleteMutation = useDeleteOrgConnectionMutation(orgId);

  const handleDelete = async (conn: GitHubConnection) => {
    toast.promise(deleteMutation.mutateAsync(conn.id), {
      loading: `Removing ${conn.providerAccountLogin ?? conn.label}...`,
      success: "Connection removed",
      error: (err: any) => err?.response?.data?.message || "Failed to remove connection",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">GitHub Connections</h3>
          <p className="text-[11px] text-white/40 mt-0.5">
            Linked GitHub accounts and organizations for this Nebula org.
          </p>
        </div>
        {canManage && (
          <ConnectGithubButton
            organizationId={orgId}
            size="sm"
            label="Add GitHub"
            returnTo={`/organizations?org=${orgId}&tab=connections`}
            className="h-8 px-4 text-xs rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer"
          />
        )}
      </div>

      {isLoading && (
        <div className="text-white/40 text-xs font-mono animate-pulse py-6 text-center">Loading connections...</div>
      )}

      {!isLoading && (!connections || connections.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-white/5 bg-white/[0.02] rounded-xl">
          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <FiGithub className="h-6 w-6 text-white/50" />
          </div>
          <h4 className="text-sm font-semibold text-white">No GitHub accounts linked</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm">
            Connect a GitHub account or organization to import repositories and configure access.
          </p>
          {canManage && (
            <div className="mt-5">
              <ConnectGithubButton
                organizationId={orgId}
                label="Connect GitHub"
                returnTo={`/organizations?org=${orgId}&tab=connections`}
                className="h-10 px-6 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90"
              />
            </div>
          )}
        </div>
      )}

      {connections && connections.length > 0 && (() => {
        const personal = connections.filter((c) => c.providerAccountType !== "ORGANIZATION");
        const orgs = connections.filter((c) => c.providerAccountType === "ORGANIZATION");

        const renderConn = (conn: GitHubConnection) => (
          <div
            key={conn.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02]"
          >
            <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[#24292f] border border-white/10 shrink-0">
              <FiGithub className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {conn.providerAccountType === "ORGANIZATION" ? (
                  <Building2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                ) : (
                  <UserCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                )}
                <p className="text-sm font-semibold text-white truncate">
                  {conn.providerAccountLogin ?? conn.label ?? "GitHub Account"}
                </p>
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                  conn.isValid
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20",
                )}>
                  {conn.isValid ? "Active" : "Invalid"}
                </span>
              </div>
              <p className="text-[11px] text-white/40 font-mono mt-0.5">
                {conn.providerAccountType === "ORGANIZATION" ? "GitHub Organization" : "Personal Account"} •{" "}
                {conn.credentialType === "OAUTH_TOKEN" ? "OAuth" : "PAT"}
              </p>
            </div>
            {canManage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(conn)}
                disabled={deleteMutation.isPending}
                className="h-8 w-8 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );

        return (
          <div className="space-y-4">
            {personal.length > 0 && (
              <div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCircle2 className="h-3 w-3 text-blue-400" /> Personal Accounts
                </p>
                <div className="space-y-2">{personal.map(renderConn)}</div>
              </div>
            )}
            {orgs.length > 0 && (
              <div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-purple-400" /> GitHub Organizations
                </p>
                <div className="space-y-2">{orgs.map(renderConn)}</div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
