"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedGuard } from "@/components/auth/ProtectedGuard";
import { useOrganizationsQuery, can } from "@/hooks/use-organization";
import { useAuthStore, useWorkspaceStore } from "@/lib/store";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateOrgModal } from "@/components/organizations/CreateOrgModal";
import { MembersTab } from "@/components/organizations/MembersTab";
import { RolesTab } from "@/components/organizations/RolesTab";
import { OrgReposTab } from "@/components/organizations/OrgReposTab";
import { TeamsTab } from "@/components/organizations/TeamsTab";
import { ConnectionsTab } from "@/components/organizations/ConnectionsTab";
import { AuditTab } from "@/components/organizations/AuditTab";
import { SettingsTab } from "@/components/organizations/SettingsTab";
import {
  ORG_NAV,
  VALID_ORG_TABS,
  orgTabHref,
  type OrgTab,
} from "@/lib/org-nav";
import { cn } from "@/lib/utils";

function OrganizationsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: orgs, isLoading } = useOrganizationsQuery();
  const user = useAuthStore((s) => s.user);
  const { workspace, setWorkspace } = useWorkspaceStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const tabParam = searchParams.get("tab");
  const orgParam = searchParams.get("org");
  const activeTab: OrgTab =
    tabParam && VALID_ORG_TABS.has(tabParam as OrgTab)
      ? (tabParam as OrgTab)
      : "members";

  const activeOrgId =
    orgParam ||
    (workspace.type === "organization" ? workspace.organizationId : null) ||
    (orgs && orgs.length > 0 ? orgs[0].id : null);

  const currentOrg = orgs?.find((o) => o.id === activeOrgId);
  const myPermissions = currentOrg?.userRole?.permissions ?? [];
  const isOwner = !!user && !!currentOrg && currentOrg.ownerId === user.id;

  const navItem = useMemo(
    () => ORG_NAV.find((t) => t.id === activeTab) ?? ORG_NAV[0],
    [activeTab]
  );
  const NavIcon = navItem.icon;

  useEffect(() => {
    if (!orgs?.length) return;

    if (orgParam) {
      const named = orgs.find((o) => o.id === orgParam);
      if (
        named &&
        !(
          workspace.type === "organization" &&
          workspace.organizationId === named.id
        )
      ) {
        setWorkspace({
          type: "organization",
          organizationId: named.id,
          organizationName: named.name,
        });
      }
      return;
    }

    // Ensure URL always carries org + tab when we have a resolved org
    if (activeOrgId) {
      router.replace(orgTabHref(activeOrgId, activeTab), { scroll: false });
    }
  }, [activeOrgId, activeTab, orgParam, orgs, router, setWorkspace, workspace]);

  const canViewTab = (tab: OrgTab) => {
    if (tab === "audit") return isOwner || can(myPermissions, "audit.read");
    if (tab === "settings")
      return isOwner || can(myPermissions, "org.manage_settings");
    return true;
  };

  useEffect(() => {
    if (!currentOrg) return;
    if (!canViewTab(activeTab)) {
      router.replace(orgTabHref(currentOrg.id, "members"), { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentOrg, isOwner, myPermissions]);

  const handleOrgDeleted = () => {
    setWorkspace({ type: "personal" });
    router.replace("/organizations");
  };

  const handleSelectOrg = (orgId: string, orgName: string) => {
    setWorkspace({
      type: "organization",
      organizationId: orgId,
      organizationName: orgName,
    });
    router.push(orgTabHref(orgId, "members"));
  };

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background nebula-bg pt-10 pb-16 px-4 sm:px-6 md:pt-8">
        <div className="mx-auto max-w-5xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-xs font-mono text-white/40 animate-pulse">
              Loading organizations...
            </div>
          ) : !orgs || orgs.length === 0 ? (
            <div className="glass-panel mx-auto my-12 max-w-xl border-dashed border-white/10 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                No Organizations
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                Create an organization to invite team members, manage roles, and
                collaborate on codebases.
              </p>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="mt-6 h-10 rounded-full px-6 font-mono text-xs uppercase tracking-wider text-white"
                style={{ background: "#4493F8" }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Organization
              </Button>
            </div>
          ) : workspace.type !== "organization" || !currentOrg ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-white">
                    <Building2 className="h-7 w-7 text-primary" />
                    Organizations
                  </h1>
                  <p className="mt-1 text-sm text-white/50">
                    Choose an organization to manage from the sidebar workspace
                    switcher, or create a new one.
                  </p>
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="h-10 cursor-pointer self-start rounded-full px-5 text-xs font-semibold shadow-[0_0_20px_-4px_rgba(68,147,248,0.5)] sm:self-auto"
                  style={{ background: "#4493F8" }}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Create Organization
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelectOrg(org.id, org.name)}
                    className={cn(
                      "glass-panel cursor-pointer border border-white/8 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <div className="text-sm font-semibold text-white">
                      {org.name}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-white/40">
                      {org.userRole?.name || "Member"} • {org.memberCount ?? 0}{" "}
                      member{(org.memberCount ?? 0) !== 1 ? "s" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                      {currentOrg.userRole?.name ?? "Member"}
                    </span>
                    <span className="font-mono text-[10px] text-white/35">
                      {currentOrg.name}
                    </span>
                  </div>
                  <h1 className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-white">
                    <NavIcon className="h-7 w-7 text-primary" />
                    {navItem.label}
                  </h1>
                  <p className="mt-1 text-sm text-white/50">
                    {navItem.description}
                  </p>
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  variant="outline"
                  className="h-9 cursor-pointer self-start rounded-xl border-white/10 bg-white/[0.03] px-3 text-xs text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> New org
                </Button>
              </div>

              <div className="glass-panel p-6">
                {activeTab === "members" && (
                  <MembersTab orgId={currentOrg.id} />
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
                    canManage={
                      isOwner || can(myPermissions, "connection.manage")
                    }
                  />
                )}
                {activeTab === "audit" && canViewTab("audit") && (
                  <AuditTab orgId={currentOrg.id} />
                )}
                {activeTab === "settings" && canViewTab("settings") && (
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
      </div>

      <CreateOrgModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={(orgId) => {
          const named = orgs?.find((o) => o.id === orgId);
          setWorkspace({
            type: "organization",
            organizationId: orgId,
            organizationName: named?.name,
          });
          router.push(orgTabHref(orgId, "members"));
        }}
      />
    </ProtectedGuard>
  );
}

export default function OrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-xs font-mono text-white/40">
          Loading organizations...
        </div>
      }
    >
      <OrganizationsView />
    </Suspense>
  );
}
