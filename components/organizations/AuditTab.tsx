"use client";

import { useOrgAuditLogsQuery, AuditLog } from "@/hooks/use-organization";
import { ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ORGANIZATION_CREATED: { label: "Org Created", color: "text-blue-400" },
  ORGANIZATION_RENAMED: { label: "Org Renamed", color: "text-blue-400" },
  MEMBER_INVITED: { label: "Member Invited", color: "text-emerald-400" },
  MEMBER_JOINED: { label: "Member Joined", color: "text-emerald-400" },
  TEAM_CREATED: { label: "Team Created", color: "text-purple-400" },
  ROLE_CREATED: { label: "Role Created", color: "text-amber-400" },
  REPO_IMPORTED: { label: "Repo Imported", color: "text-cyan-400" },
  REPO_DELETED: { label: "Repo Deleted", color: "text-rose-400" },
};

interface AuditTabProps {
  orgId: string;
}

export function AuditTab({ orgId }: AuditTabProps) {
  const { data: logs, isLoading } = useOrgAuditLogsQuery(orgId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Audit Log</h3>
        <p className="text-[11px] text-white/40 mt-0.5">
          Track actions taken by members in this organization.
        </p>
      </div>

      {isLoading && (
        <div className="text-white/40 text-xs font-mono animate-pulse py-6 text-center">Loading audit log...</div>
      )}

      {!isLoading && (!logs || logs.length === 0) && (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-white/5 bg-white/[0.02] rounded-xl">
          <ClipboardList className="h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No audit events yet.</p>
        </div>
      )}

      {logs && logs.length > 0 && (
        <div className="space-y-1.5">
          {logs.map((log) => {
            const actionMeta = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-white/50" };
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 py-3 px-4 rounded-xl border border-white/5 bg-white/[0.015]"
              >
                <div className="h-7 w-7 shrink-0 rounded-md bg-white/5 border border-white/8 flex items-center justify-center mt-0.5">
                  <User className="h-3.5 w-3.5 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs font-mono font-semibold", actionMeta.color)}>
                      {actionMeta.label}
                    </span>
                    {log.resourceType && log.resourceId && (
                      <span className="text-[10px] text-white/35 font-mono">
                        {log.resourceType}/{log.resourceId.substring(0, 8)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    by{" "}
                    <span className="text-white/70 font-medium">
                      {log.actor.fullName || log.actor.email}
                    </span>
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <p className="text-[10px] text-white/30 font-mono mt-0.5 truncate">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-white/30 font-mono shrink-0 mt-0.5 tabular-nums">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
