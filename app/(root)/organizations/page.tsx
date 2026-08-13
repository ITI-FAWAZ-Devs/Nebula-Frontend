"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProtectedGuard } from "@/components/auth/ProtectedGuard";
import { useOrganizationsQuery } from "@/hooks/use-organization";
import { useAuthStore } from "@/lib/store";
import { can } from "@/hooks/use-organization";
import {
  Building2, Plus, Users, Shield, Database,
  FolderGit2, Link2, ClipboardList, Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreateOrgModal } from "@/components/organizations/CreateOrgModal";
import { MembersTab } from "@/components/organizations/MembersTab";
import { RolesTab } from "@/components/organizations/RolesTab";
import { OrgReposTab } from "@/components/organizations/OrgReposTab";
import { TeamsTab } from "@/components/organizations/TeamsTab";
import { ConnectionsTab } from "@/components/organizations/ConnectionsTab";
import { AuditTab } from "@/components/organizations/AuditTab";
import { SettingsTab } from "@/components/organizations/SettingsTab";

type Tab = "members" | "roles" | "repositories" | "teams" | "connections" | "audit" | "settings";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "repositories", label: "Repositories", icon: FolderGit2 },
  { id: "teams", label: "Teams", icon: Database },
  { id: "connections", label: "Connections", icon: Link2 },
  { id: "audit", label: "Audit", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export default function OrganizationsPage() {
  const { data: orgs, isLoading } = useOrganizationsQuery();
  const user = useAuthStore((s) => s.user);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const activeOrgId = selectedOrgId || (orgs && orgs.length > 0 ? orgs[0].id : null);
  const currentOrg = orgs?.find((o) => o.id === activeOrgId);
  const myPermissions = currentOrg?.userRole?.permissions ?? [];
  const isOwner = !!user && !!currentOrg && currentOrg.ownerId === user.id;

  const handleOrgDeleted = () => {
    setSelectedOrgId(null);
    setActiveTab("members");
  };

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background nebula-bg pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <Building2 className="h-7 w-7 text-primary" />
                Organizations
              </h1>
              <p className="text-sm text-white/50 mt-1">
                Manage members, roles, teams, GitHub connections, and access control.
              </p>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="h-10 px-5 text-xs font-semibold rounded-full shadow-[0_0_20px_-4px_rgba(68,147,248,0.5)] cursor-pointer self-start sm:self-auto"
              style={{ background: "#4493F8" }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Create Organization
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-white/40 font-mono text-xs animate-pulse">
              Loading organizations...
            </div>
          ) : !orgs || orgs.length === 0 ? (
            <div className="glass-panel p-12 text-center max-w-xl mx-auto my-12 border-dashed border-white/10">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">No Organizations</h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Create an organization to invite team members, manage roles, and collaborate on codebases.
              </p>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="mt-6 rounded-full px-6 h-10 font-mono text-xs uppercase tracking-wider text-white"
                style={{ background: "#4493F8" }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Organization
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
              {/* Sidebar: Org list */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 px-1">
                  Your Organizations ({orgs.length})
                </div>
                <div className="space-y-1.5">
                  {orgs.map((org) => {
                    const isSelected = org.id === activeOrgId;
                    return (
                      <button
                        key={org.id}
                        onClick={() => { setSelectedOrgId(org.id); setActiveTab("members"); }}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary/10 border-primary/40 text-white shadow-[0_0_20px_-5px_rgba(68,147,248,0.2)]"
                            : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.04] hover:text-white",
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold truncate text-white">{org.name}</div>
                          <div className="text-[10px] font-mono text-white/40 mt-0.5 truncate">
                            {org.userRole?.name || "Member"} • {org.memberCount ?? 0} member{(org.memberCount ?? 0) !== 1 ? "s" : ""}
                          </div>
                        </div>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main content */}
              {currentOrg && (
                <div className="space-y-6">
                  {/* Org header */}
                  <div className="glass-panel p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="font-display text-xl font-bold text-white">{currentOrg.name}</h2>
                        <p className="text-[11px] text-white/40 font-mono mt-0.5">
                          Created {new Date(currentOrg.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full self-start sm:self-auto">
                        {currentOrg.userRole?.name ?? "Member"}
                      </span>
                    </div>

                    {/* Tab nav */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        // Hide audit tab unless user has audit.read permission
                        if (tab.id === "audit" && !isOwner && !can(myPermissions, "audit.read")) return null;
                        // Hide settings unless owner or manage_settings
                        if (tab.id === "settings" && !isOwner && !can(myPermissions, "org.manage_settings")) return null;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer",
                              isActive
                                ? "bg-primary/15 text-primary font-semibold"
                                : "text-white/50 hover:text-white hover:bg-white/5",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" /> {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="glass-panel p-6">
                    {activeTab === "members" && (
                      <MembersTab
                        orgId={currentOrg.id}
                      />
                    )}
                    {activeTab === "roles" && (
                      <RolesTab
                        orgId={currentOrg.id}
                        userPermissions={myPermissions}
                      />
                    )}
                    {activeTab === "repositories" && (
                      <OrgReposTab
                        orgId={currentOrg.id}
                        canDelete={isOwner || can(myPermissions, "repo.delete")}
                      />
                    )}
                    {activeTab === "teams" && (
                      <TeamsTab
                        orgId={currentOrg.id}
                        canManage={isOwner || can(myPermissions, "team.manage")}
                      />
                    )}
                    {activeTab === "connections" && (
                      <ConnectionsTab
                        orgId={currentOrg.id}
                        canManage={isOwner || can(myPermissions, "connection.manage")}
                      />
                    )}
                    {activeTab === "audit" && <AuditTab orgId={currentOrg.id} />}
                    {activeTab === "settings" && (
                      <SettingsTab
                        org={currentOrg}
                        isOwner={isOwner}
                        onDeleted={handleOrgDeleted}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateOrgModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={(orgId) => setSelectedOrgId(orgId)}
      />
    </ProtectedGuard>
  );
}
