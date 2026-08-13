"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRenameOrganizationMutation, useDeleteOrganizationMutation } from "@/hooks/use-organization";
import { Organization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface SettingsTabProps {
  org: Organization;
  isOwner: boolean;
  onDeleted: () => void;
}

export function SettingsTab({ org, isOwner, onDeleted }: SettingsTabProps) {
  const renameMutation = useRenameOrganizationMutation(org.id);
  const deleteMutation = useDeleteOrganizationMutation();

  const [name, setName] = useState(org.name);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === org.name) return;
    try {
      await renameMutation.mutateAsync(name.trim());
      toast.success("Organization renamed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to rename");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== org.name) return;
    toast.promise(deleteMutation.mutateAsync(org.id), {
      loading: "Deleting organization...",
      success: () => {
        onDeleted();
        return "Organization deleted";
      },
      error: (err: any) => err?.response?.data?.message || "Failed to delete organization",
    });
  };

  return (
    <div className="space-y-8">
      {/* Rename */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Organization Name</h3>
        <p className="text-[11px] text-white/40 mb-4">Rename your organization. The URL and IDs remain unchanged.</p>
        <form onSubmit={handleRename} className="flex gap-2 max-w-sm">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/40 border-white/10 text-white placeholder:text-white/25 text-xs h-9 flex-1"
          />
          <Button
            type="submit"
            disabled={!name.trim() || name === org.name || renameMutation.isPending}
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
          >
            {renameMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>

      {/* Billing stub */}
      {isOwner && (
        <div className="border border-white/8 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Billing</h3>
          <p className="text-[11px] text-white/40">
            Billing management is coming soon. Your organization is currently on the free tier.
          </p>
        </div>
      )}

      {/* Danger zone */}
      {isOwner && (
        <div className="border border-rose-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <h3 className="text-sm font-semibold text-rose-400">Danger Zone</h3>
          </div>

          {!showDeleteForm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Delete this organization</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  This action is permanent and cannot be undone. All data will be lost.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteForm(true)}
                className="h-8 px-4 text-xs font-semibold rounded-lg border-rose-500/40 text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
              >
                Delete
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-white/60">
                Type <span className="font-mono text-rose-400">{org.name}</span> to confirm deletion.
              </p>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={org.name}
                className="bg-black/40 border-rose-500/30 text-white placeholder:text-white/25 text-xs h-9 max-w-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDeleteForm(false); setDeleteConfirm(""); }}
                  className="h-8 px-4 text-xs rounded-lg border-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteConfirm !== org.name || deleteMutation.isPending}
                  className="h-8 px-4 text-xs font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Organization"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
