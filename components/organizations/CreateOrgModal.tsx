"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrganizationMutation } from "@/hooks/use-organization";

interface CreateOrgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (org: { id: string; name: string }) => void;
}

export function CreateOrgModal({ open, onOpenChange, onCreated }: CreateOrgModalProps) {
  const [name, setName] = useState("");
  const createMutation = useCreateOrganizationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const org = await createMutation.mutateAsync({ name: name.trim() });
      toast.success(`Organization "${org.name}" created!`);
      setName("");
      onOpenChange(false);
      if (onCreated) onCreated({ id: org.id, name: org.name });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create organization.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-background/95 backdrop-blur-xl text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <DialogTitle className="font-display text-lg font-bold">
              Create Organization
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/50">
            Set up a collaborative workspace to manage repositories, custom roles, and access permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/50">
              Organization Name
            </label>
            <Input
              placeholder="e.g. Acme Corp, Engineering, Product Lab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/30 border-white/10 text-white placeholder:text-white/20 h-10"
              autoFocus
            />
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
              disabled={!name.trim() || createMutation.isPending}
              className="h-9 text-xs font-semibold px-5"
              style={{ background: "#4493F8" }}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
