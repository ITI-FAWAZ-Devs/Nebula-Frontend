"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Shield, Plus, Edit2, Trash2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useOrgRolesQuery,
  useDeleteOrgRoleMutation,
  Role,
} from "@/hooks/use-organization";
import { RoleBuilderModal } from "./RoleBuilderModal";

interface RolesTabProps {
  orgId: string;
  userPermissions: string[];
}

export function RolesTab({ orgId, userPermissions }: RolesTabProps) {
  const canManage = userPermissions.includes("org:manage");
  const { data: roles, isLoading: loadingRoles } = useOrgRolesQuery(orgId);
  const deleteRoleMutation = useDeleteOrgRoleMutation(orgId);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const handleOpenCreate = () => {
    setRoleToEdit(null);
    setRoleModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setRoleToEdit(role);
    setRoleModalOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.name === "Owner") {
      toast.error("The Owner role cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${role.name}" role?`)) return;

    toast.promise(deleteRoleMutation.mutateAsync(role.id), {
      loading: "Deleting role...",
      success: "Role deleted.",
      error: (err: any) => err?.response?.data?.message || "Failed to delete role.",
    });
  };

  if (loadingRoles) {
    return (
      <div className="flex justify-center items-center py-20 text-white/50 animate-pulse font-mono text-xs">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Fetching organization roles...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Custom Roles & Access Control</h3>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            Compose permission sets to gate repositories, docs, and task operations
          </p>
        </div>

        {canManage && (
          <Button
            onClick={handleOpenCreate}
            className="h-8 text-xs font-semibold px-4 rounded-full"
            style={{ background: "#4493F8" }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Role
          </Button>
        )}
      </div>

      {/* Roles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles?.map((role) => {
          const isOwnerRole = role.name === "Owner";
          const isSystemDefault = ["Owner", "Developer", "Team Manager"].includes(role.name);

          return (
            <div
              key={role.id}
              className="glass-panel p-5 space-y-3.5 flex flex-col justify-between border-white/5 hover:border-white/10 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${isOwnerRole ? "text-amber-400" : isSystemDefault ? "text-sky-400" : "text-primary"}`} />
                    <span className="text-sm font-bold text-white">{role.name}</span>
                  </div>

                  {isOwnerRole ? (
                    <Badge variant="outline" className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border-amber-500/20">
                      System Role
                    </Badge>
                  ) : isSystemDefault ? (
                    <Badge variant="outline" className="text-[9px] font-mono bg-sky-500/10 text-sky-400 border-sky-500/20">
                      Default
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] font-mono bg-primary/10 text-primary border-primary/20">
                      Custom
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mt-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    Permissions ({role.permissions.length}):
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto no-scrollbar">
                    {role.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-[9px] font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded text-white/70"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>{role._count?.members || 0} members assigned</span>

                {!isOwnerRole && canManage && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(role)}
                      className="h-7 px-2.5 text-xs text-white/60 hover:text-white border border-white/5"
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RoleBuilderModal
        orgId={orgId}
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        roleToEdit={roleToEdit}
      />
    </div>
  );
}
