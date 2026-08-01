"use client";

import { useState } from "react";
import { ProtectedGuard } from "@/components/auth/ProtectedGuard";
import { useOrganizationsQuery } from "@/hooks/use-organization";
import { Building2, Plus, Users, Shield, Settings, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateOrgModal } from "@/components/organizations/CreateOrgModal";
import { MembersTab } from "@/components/organizations/MembersTab";
import { RolesTab } from "@/components/organizations/RolesTab";

export default function OrganizationsPage() {
  const { data: orgs, isLoading } = useOrganizationsQuery();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "roles">("members");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Auto-select first org if available and none selected
  const activeOrgId = selectedOrgId || (orgs && orgs.length > 0 ? orgs[0].id : null);
  const currentOrg = orgs?.find((o) => o.id === activeOrgId);

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background nebula-bg pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <Building2 className="h-7 w-7 text-primary" />
                Organizations & Workspaces
              </h1>
              <p className="text-sm text-white/50 mt-1">
                Collaborate with teams, build custom role-based access rules, and scope repositories.
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
              Loading workspaces...
            </div>
          ) : !orgs || orgs.length === 0 ? (
            /* Empty State */
            <div className="glass-panel p-12 text-center max-w-xl mx-auto my-12 border-dashed border-white/10">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">No Organizations Found</h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                You are currently working in a solo personal context. Create an organization to invite team members and manage custom roles.
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
            /* Organizations Workspace UI */
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
              {/* Sidebar: Org Selector List */}
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
                        onClick={() => setSelectedOrgId(org.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 border-primary/40 text-white shadow-[0_0_20px_-5px_rgba(68,147,248,0.2)]"
                            : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold truncate text-white">{org.name}</div>
                          <div className="text-[10px] font-mono text-white/40 mt-0.5 truncate">
                            Role: {org.userRole?.name || "Member"}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Area for Active Org */}
              {currentOrg && (
                <div className="space-y-6">
                  {/* Active Org Banner */}
                  <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold text-white">{currentOrg.name}</h2>
                        <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                          ID: {currentOrg.id.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-mono mt-1">
                        Created {new Date(currentOrg.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                      <button
                        onClick={() => setActiveTab("members")}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          activeTab === "members"
                            ? "bg-primary text-white font-semibold shadow-md"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" /> Members
                      </button>
                      <button
                        onClick={() => setActiveTab("roles")}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          activeTab === "roles"
                            ? "bg-primary text-white font-semibold shadow-md"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        <Shield className="h-3.5 w-3.5" /> Custom Roles
                      </button>
                    </div>
                  </div>

                  {/* Tab Panel */}
                  <div className="glass-panel p-6">
                    {activeTab === "members" && <MembersTab orgId={currentOrg.id} />}
                    {activeTab === "roles" && <RolesTab orgId={currentOrg.id} />}
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
