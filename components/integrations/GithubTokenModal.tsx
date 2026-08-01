"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Key, ShieldCheck, Trash2, ExternalLink, Check, AlertTriangle, Loader2 } from "lucide-react";
import { FiGithub } from "react-icons/fi";
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
  useGithubTokenStatusQuery,
  useSaveGithubTokenMutation,
  useRemoveGithubTokenMutation,
} from "@/hooks/use-github-token";

interface GithubTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GithubTokenModal({ open, onOpenChange, onSuccess }: GithubTokenModalProps) {
  const { data: status, isLoading } = useGithubTokenStatusQuery();
  const saveMutation = useSaveGithubTokenMutation();
  const removeMutation = useRemoveGithubTokenMutation();

  const [patInput, setPatInput] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;

    toast.promise(saveMutation.mutateAsync(patInput.trim()), {
      loading: "Validating Personal Access Token with GitHub...",
      success: () => {
        setPatInput("");
        if (onSuccess) onSuccess();
        return "GitHub PAT successfully verified and encrypted!";
      },
      error: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Failed to validate PAT.";
        return `Validation Error: ${msg}`;
      },
    });
  };

  const handleRemove = async () => {
    toast.promise(removeMutation.mutateAsync(), {
      loading: "Revoking token...",
      success: "GitHub PAT removed.",
      error: "Failed to remove token.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-background/95 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(59,130,246,0.15)] text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Key className="h-4 w-4" />
            </div>
            <DialogTitle className="font-display text-lg font-bold text-white">
              GitHub Access Token
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-white/50 leading-relaxed">
            Nebula requires a fine-grained or classic Personal Access Token (PAT) with <code className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">repo</code> scope to clone and index repositories.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {status?.hasToken ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>PAT Active & Encrypted</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                    AES-256-GCM
                  </span>
                </div>

                <div className="text-[11px] text-white/60 space-y-1 font-mono">
                  <p>Scopes: <span className="text-white font-medium">{status.scopes?.join(", ") || "repo"}</span></p>
                  {status.lastValidatedAt && (
                    <p>Last Verified: {new Date(status.lastValidatedAt).toLocaleString()}</p>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={removeMutation.isPending}
                    className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Revoke Token
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white/50 flex items-center justify-between">
                    <span>Personal Access Token</span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=Nebula%20Command%20Center"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 normal-case tracking-normal"
                    >
                      Generate PAT <ExternalLink className="h-3 w-3" />
                    </a>
                  </label>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    className="bg-black/30 border-white/10 text-white placeholder:text-white/20 font-mono text-xs h-10"
                  />
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-[11px] text-white/60 space-y-1.5">
                  <p className="font-semibold text-white/80 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Why is a PAT needed?
                  </p>
                  <ul className="list-disc list-inside text-white/50 space-y-0.5 font-mono text-[10px]">
                    <li>Direct repository import authorization</li>
                    <li>Supports fine-grained private repo permissions</li>
                    <li>Encrypted at rest using AES-256-GCM</li>
                  </ul>
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
                    disabled={!patInput.trim() || saveMutation.isPending}
                    className="h-9 text-xs font-semibold px-5"
                    style={{ background: "#4493F8" }}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      "Save Token"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
