"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Shield, Trash2, Clock, CheckCircle2, Loader2, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useOrgMembersQuery,
  useOrgRolesQuery,
  useChangeOrgMemberRoleMutation,
  useRemoveOrgMemberMutation,
  OrganizationMember,
} from "@/hooks/use-organization";
import { InviteMemberModal } from "./InviteMemberModal";

interface MembersTabProps {
  orgId: string;
}

export function MembersTab({ orgId }: MembersTabProps) {
  const { data: members, isLoading: loadingMembers } = useOrgMembersQuery(orgId);
  const { data: roles } = useOrgRolesQuery(orgId);

  const changeRoleMutation = useChangeOrgMemberRoleMutation(orgId);
  const removeMemberMutation = useRemoveOrgMemberMutation(orgId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleRoleChange = async (memberId: string, newRoleId: string) => {
    toast.promise(
      changeRoleMutation.mutateAsync({ memberId, roleId: newRoleId }),
      {
        loading: "Updating member role...",
        success: "Member role updated successfully!",
        error: (err: any) => err?.response?.data?.message || "Failed to update role.",
      }
    );
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from this organization?`)) return;

    toast.promise(
      removeMemberMutation.mutateAsync(memberId),
      {
        loading: "Removing member...",
        success: "Member removed from organization.",
        error: (err: any) => err?.response?.data?.message || "Failed to remove member.",
      }
    );
  };

  if (loadingMembers) {
    return (
      <div className="flex justify-center items-center py-20 text-white/50 animate-pulse font-mono text-xs">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Fetching organization members...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Active Members & Invitations</h3>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            {members?.length || 0} total members registered
          </p>
        </div>

        <Button
          onClick={() => setInviteModalOpen(true)}
          className="h-8 text-xs font-semibold px-4 rounded-full"
          style={{ background: "#4493F8" }}
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Invite Member
        </Button>
      </div>

      {/* Members list */}
      <div className="space-y-2">
        {members?.map((member) => {
          const isPending = member.status === "PENDING";
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <Avatar size="sm" className="ring-1 ring-white/10">
                  <AvatarImage src={member.user.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {(member.user.fullName || member.user.email).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {member.user.fullName || member.user.email}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono px-2 py-0.2 uppercase border ${
                        isPending
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {isPending ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Active
                        </span>
                      )}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Role dropdown */}
                <Select
                  value={member.role.id}
                  onValueChange={(newRoleId) => newRoleId && handleRoleChange(member.id, newRoleId)}
                >
                  <SelectTrigger className="h-8 bg-black/20 border-white/10 text-white text-[11px] font-mono w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10 bg-popover/95 text-white">
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-[11px] font-mono">
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id, member.user.email)}
                  className="h-8 w-8 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove Member"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <InviteMemberModal
        orgId={orgId}
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  );
}
