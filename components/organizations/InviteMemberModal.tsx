"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useInviteOrgMemberMutation,
  useOrgRolesQuery,
} from "@/hooks/use-organization";

interface InviteMemberModalProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({ orgId, open, onOpenChange }: InviteMemberModalProps) {
  const { data: roles, isLoading: loadingRoles } = useOrgRolesQuery(orgId);
  const inviteMutation = useInviteOrgMemberMutation(orgId);

  const [email, setEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !selectedRoleId) return;

    try {
      const res = await inviteMutation.mutateAsync({
        email: email.trim(),
        roleId: selectedRoleId,
      });
      toast.success(`Invitation sent to ${email}!`);
      setEmail("");
      setSelectedRoleId("");
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send invitation.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <UserPlus className="h-4 w-4" />
            </div>
            <DialogTitle className="font-display text-lg font-bold">
              Invite Organization Member
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/50">
            Send an invitation email to a registered Nebula user and assign their access role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/50">
              User Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-white/30" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/30 border-white/10 text-white placeholder:text-white/20 h-10 pl-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 w-full">
              Assign Role
            </label>
            <Select value={selectedRoleId} onValueChange={(val) => setSelectedRoleId(val || "")}>
              <SelectTrigger className="bg-black/30 border-white/10 text-white h-10 text-xs font-mono w-full">
                <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select role..."}>
                  {selectedRoleId
                    ? (roles?.find((r) => r.id === selectedRoleId)?.name ?? "Select role...")
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10 bg-popover/95 text-white">
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id} className="text-xs font-mono">
                    {role.name} ({role.permissions.length} permissions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs border border-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email.trim() || !selectedRoleId || inviteMutation.isPending}
              className="h-9 text-xs font-semibold px-5"
              style={{ background: "#4493F8" }}
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
