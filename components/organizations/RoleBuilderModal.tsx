"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shield, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateOrgRoleMutation,
  useUpdateOrgRoleMutation,
  PERMISSION_CATALOG,
  Role,
} from "@/hooks/use-organization";

interface RoleBuilderModalProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit?: Role | null;
}

export function RoleBuilderModal({
  orgId,
  open,
  onOpenChange,
  roleToEdit,
}: RoleBuilderModalProps) {
  const createRoleMutation = useCreateOrgRoleMutation(orgId);
  const updateRoleMutation = useUpdateOrgRoleMutation(orgId);

  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setSelectedPermissions(roleToEdit.permissions || []);
    } else {
      setName("");
      setSelectedPermissions([]);
    }
  }, [roleToEdit, open]);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedPermissions(PERMISSION_CATALOG.map((p) => p.id));
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (selectedPermissions.length === 0) {
      toast.error("Select at least one permission for this role.");
      return;
    }

    try {
      if (roleToEdit) {
        await updateRoleMutation.mutateAsync({
          roleId: roleToEdit.id,
          name: name.trim(),
          permissions: selectedPermissions,
        });
        toast.success(`Role "${name}" updated!`);
      } else {
        await createRoleMutation.mutateAsync({
          name: name.trim(),
          permissions: selectedPermissions,
        });
        toast.success(`Role "${name}" created!`);
      }
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save role.";
      toast.error(msg);
    }
  };

  const isPending = createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <DialogTitle className="font-display text-lg font-bold">
              {roleToEdit ? `Edit Role: ${roleToEdit.name}` : "Create Custom Role"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/50">
            Compose a fine-grained permission set to assign to organization members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/50">
              Role Name
            </label>
            <Input
              placeholder="e.g. Documentation Viewer, Release Engineer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/30 border-white/10 text-white placeholder:text-white/20 h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                Permission Catalog ({selectedPermissions.length} selected)
              </label>
              <div className="flex gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1.5 pr-1">
              {PERMISSION_CATALOG.map((perm) => {
                const checked = selectedPermissions.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                      checked
                        ? "bg-primary/10 border-primary/30 text-white"
                        : "bg-white/[0.02] border-white/5 text-white/60 hover:border-white/10"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePermission(perm.id)}
                      className="mt-0.5"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{perm.label}</span>
                        <code className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                          {perm.id}
                        </code>
                      </div>
                      <p className="text-[10px] text-white/40 mt-0.5">{perm.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
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
              disabled={!name.trim() || selectedPermissions.length === 0 || isPending}
              className="h-9 text-xs font-semibold px-5"
              style={{ background: "#4493F8" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Role"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
