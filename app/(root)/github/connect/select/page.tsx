"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSaveGithubConnectionsMutation } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { FiGithub, FiCheck } from "react-icons/fi";
import { Building2, UserCircle2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "motion/react";

interface GithubAccount {
  login: string;
  id: string;
  type: "USER" | "ORGANIZATION";
  avatarUrl: string | null;
}

interface ConnectData {
  accessToken: string;
  githubLogin: string;
  githubId: string;
  user: GithubAccount;
  orgs: GithubAccount[];
  userId: string | null;
  workspace: "personal" | "organization";
  organizationId: string | null;
  /** Logins of connections that are already saved for this user/org. */
  existingLogins: string[];
  /** Path to navigate back to after saving (e.g. /settings, /organizations). */
  returnTo: string | null;
}

function GithubConnectSelectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const saveConnections = useSaveGithubConnectionsMutation();

  const data = useMemo<ConnectData | null>(() => {
    const raw = searchParams.get("data");
    if (!raw) return null;
    try {
      return JSON.parse(atob(decodeURIComponent(raw))) as ConnectData;
    } catch {
      toast.error("Invalid connection data");
      return null;
    }
  }, [searchParams]);

  // Pre-select accounts that are NOT already saved
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!data) return new Set();
    const existing = new Set(data.existingLogins ?? []);
    // Pre-select personal account if it's not already saved
    const initial = new Set<string>();
    if (!existing.has(data.user?.login)) {
      initial.add(data.user?.login);
    }
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);

  const existingLogins = useMemo(
    () => new Set(data?.existingLogins ?? []),
    [data],
  );

  const toggle = (login: string) => {
    if (existingLogins.has(login)) return; // already saved — not toggleable
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(login)) {
        next.delete(login);
      } else {
        next.add(login);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!data || selected.size === 0) return;
    setIsSaving(true);

    const allAccounts = [data.user, ...data.orgs];
    const selections = allAccounts.filter((a) => selected.has(a.login));

    try {
      await saveConnections.mutateAsync({
        accessToken: data.accessToken,
        userId: data.userId ?? undefined,
        selections,
        workspace: data.workspace,
        organizationId: data.organizationId,
      });
      toast.success(
        `${selections.length} GitHub connection${selections.length > 1 ? "s" : ""} saved`,
      );
      router.push(data.returnTo ?? "/launch");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ??
        (err as Error)?.message ??
        "Failed to save connections";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

  const allAccounts: GithubAccount[] = [data.user, ...data.orgs];
  const newSelectionCount = selected.size;
  const alreadyCount = existingLogins.size;

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24292f] border border-white/10">
            <FiGithub className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Connect GitHub accounts</h1>
            <p className="text-xs text-white/45 mt-0.5">
              Select which GitHub accounts to link to your{" "}
              {data.workspace === "organization" ? "organization" : "personal"} workspace.
            </p>
          </div>
        </div>

        {alreadyCount > 0 && (
          <p className="text-[11px] font-mono text-white/35 mb-3 px-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 inline mr-1 -mt-0.5" />
            {alreadyCount} account{alreadyCount !== 1 ? "s" : ""} already connected — shown below.
          </p>
        )}

        <div className="space-y-2 mb-6">
          {allAccounts.map((account) => {
            const isAlready = existingLogins.has(account.login);
            const isSelected = selected.has(account.login);
            return (
              <button
                key={account.login}
                type="button"
                onClick={() => toggle(account.login)}
                disabled={isAlready}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                  isAlready
                    ? "border-emerald-500/20 bg-emerald-500/5 cursor-default opacity-70"
                    : isSelected
                      ? "border-primary/40 bg-primary/5 cursor-pointer"
                      : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 cursor-pointer",
                )}
              >
                <div className="shrink-0 h-9 w-9 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  {account.avatarUrl ? (
                    <img src={account.avatarUrl} alt={account.login} className="h-full w-full object-cover" />
                  ) : account.type === "ORGANIZATION" ? (
                    <Building2 className="h-4 w-4 text-purple-400" />
                  ) : (
                    <UserCircle2 className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{account.login}</p>
                  <p className="text-[11px] text-white/40">
                    {account.type === "ORGANIZATION" ? "GitHub Organization" : "Personal Account"}
                    {isAlready && (
                      <span className="ml-2 text-emerald-400 font-mono">• already connected</span>
                    )}
                  </p>
                </div>
                <div
                  className={cn(
                    "shrink-0 h-5 w-5 rounded-md border flex items-center justify-center transition-all",
                    isAlready
                      ? "bg-emerald-500/20 border-emerald-500/40"
                      : isSelected
                        ? "bg-primary border-primary"
                        : "bg-transparent border-white/20",
                  )}
                >
                  {(isAlready || isSelected) && (
                    <FiCheck className={cn("h-3 w-3", isAlready ? "text-emerald-400" : "text-white")} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || newSelectionCount === 0}
          className="w-full h-10 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #4493F8 0%, #6366F1 100%)" }}
        >
          {isSaving
            ? "Saving..."
            : newSelectionCount === 0
              ? "Select accounts to connect"
              : `Connect ${newSelectionCount} account${newSelectionCount !== 1 ? "s" : ""}`}
        </Button>

        <button
          type="button"
          onClick={() => router.push(data.returnTo ?? "/launch")}
          className="w-full mt-3 text-xs text-white/35 hover:text-white/60 transition-colors py-2"
        >
          {data.returnTo ? "Go back" : "Skip for now"}
        </button>
      </motion.div>
    </div>
  );
}

export default function GithubConnectSelectPage() {
  return (
    <Suspense>
      <GithubConnectSelectContent />
    </Suspense>
  );
}
