"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSaveGithubConnectionsMutation } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { FiGithub, FiCheck } from "react-icons/fi";
import { Building2, UserCircle2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "motion/react";
import { api } from "@/utils/api";
import { ConnectGithubButton } from "@/components/integrations/ConnectGithubButton";

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
  existingLogins: string[];
  returnTo: string | null;
  /** 'add-org' when initiated from the Add Organization flow */
  flow?: string | null;
}

function safeAppPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/launch";
  }
  return path;
}

function parseLegacyDataParam(raw: string | null): ConnectData | null {
  if (!raw) return null;
  try {
    return JSON.parse(atob(decodeURIComponent(raw))) as ConnectData;
  } catch {
    return null;
  }
}

function GithubConnectSelectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const saveConnections = useSaveGithubConnectionsMutation();
  const sid = searchParams.get("sid");

  const [data, setData] = useState<ConnectData | null>(() =>
    parseLegacyDataParam(searchParams.get("data")),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!sid) {
      if (!data) setLoadError("Invalid connection data");
      return;
    }

    let cancelled = false;
    api
      .get("/api/auth/github/connect/pending", { params: { sid } })
      .then((res) => {
        if (cancelled) return;
        setData(res.data.data as ConnectData);
        setLoadError(null);
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        if (cancelled) return;
        setLoadError(
          err?.response?.data?.message ||
            "GitHub connect session expired. Please try connecting again.",
        );
      });

    return () => {
      cancelled = true;
    };
    // Intentionally run once per sid; `data` is a fallback for the legacy query param.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  const existingLogins = useMemo(
    () => new Set(data?.existingLogins ?? []),
    [data],
  );

  const isAddOrgFlow = data?.flow === "add-org";

  useEffect(() => {
    if (!data) return;
    const existing = new Set(data.existingLogins ?? []);
    const initial = new Set<string>();
    if (data.flow === "add-org") {
      // Add-org mode: only brand-new organizations, all pre-selected
      (data.orgs ?? []).forEach((o) => {
        if (o.type === "ORGANIZATION" && !existing.has(o.login)) {
          initial.add(o.login);
        }
      });
    } else if (data.user?.login && !existing.has(data.user.login)) {
      initial.add(data.user.login);
    }
    setSelected(initial);
  }, [data]);

  const toggle = (login: string) => {
    if (existingLogins.has(login)) return;
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
        sid: sid ?? undefined,
      });
      toast.success(
        `${selections.length} GitHub connection${selections.length > 1 ? "s" : ""} saved`,
      );
      router.push(safeAppPath(data.returnTo));
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

  if (loadError && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-white/60">{loadError}</p>
        <ConnectGithubButton
          returnTo="/launch?import=1"
          label="Connect GitHub again"
          className="h-10 rounded-xl bg-primary px-6 font-mono text-xs text-white hover:bg-primary/90"
        />
        <button
          type="button"
          onClick={() => router.push("/launch?import=1")}
          className="text-xs text-primary hover:underline"
        >
          Back to import
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-white/40">Loading...</div>
      </div>
    );
  }

  const isAddOrg = data.flow === "add-org";
  const allAccounts: GithubAccount[] = isAddOrg
    ? (data.orgs ?? []).filter(
        (o) => o.type === "ORGANIZATION" && !existingLogins.has(o.login),
      )
    : [data.user, ...(data.orgs ?? [])];

  if (isAddOrg && allAccounts.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Building2 className="h-10 w-10 text-white/30" />
        <div>
          <h1 className="text-lg font-bold text-white">No new organizations</h1>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
            None of your GitHub organizations are pending access. To add an
            organization you own or administer, grant it access from your GitHub
            settings, then try again.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(safeAppPath(data.returnTo))}
          className="text-xs text-primary hover:underline"
        >
          Back to Nebula
        </button>
      </div>
    );
  }

  const newSelectionCount = selected.size;
  const alreadyCount = existingLogins.size;
  const backHref = safeAppPath(data.returnTo);

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#24292f]">
            <FiGithub className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {isAddOrg ? "Add GitHub organizations" : "Connect GitHub accounts"}
            </h1>
            <p className="mt-0.5 text-xs text-white/45">
              {isAddOrg
                ? "Select the GitHub organizations you want to grant Nebula access to."
                : `Select which GitHub accounts to link to your ${
                    data.workspace === "organization" ? "organization" : "personal"
                  } workspace.`}
            </p>
          </div>
        </div>

        {!isAddOrg && alreadyCount > 0 && (
          <p className="mb-3 px-1 font-mono text-[11px] text-white/35">
            <CheckCircle2 className="mr-1 -mt-0.5 inline h-3 w-3 text-emerald-400" />
            {alreadyCount} account{alreadyCount !== 1 ? "s" : ""} already connected — shown below.
          </p>
        )}

        <div className="mb-6 space-y-2">
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
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                  isAlready
                    ? "cursor-default border-emerald-500/20 bg-emerald-500/5 opacity-70"
                    : isSelected
                      ? "cursor-pointer border-primary/40 bg-primary/5"
                      : "cursor-pointer border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]",
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {account.avatarUrl ? (
                    <img src={account.avatarUrl} alt={account.login} className="h-full w-full object-cover" />
                  ) : account.type === "ORGANIZATION" ? (
                    <Building2 className="h-4 w-4 text-purple-400" />
                  ) : (
                    <UserCircle2 className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{account.login}</p>
                  <p className="text-[11px] text-white/40">
                    {account.type === "ORGANIZATION" ? "GitHub Organization" : "Personal Account"}
                    {isAlready && (
                      <span className="ml-2 font-mono text-emerald-400">• already connected</span>
                    )}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                    isAlready
                      ? "border-emerald-500/40 bg-emerald-500/20"
                      : isSelected
                        ? "border-primary bg-primary"
                        : "border-white/20 bg-transparent",
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
          className="h-10 w-full rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #4493F8 0%, #6366F1 100%)" }}
        >
          {isSaving
            ? "Saving..."
            : newSelectionCount === 0
              ? isAddOrg
                ? "Select organizations to add"
                : "Select accounts to connect"
              : isAddOrg
                ? `Add ${newSelectionCount} organization${newSelectionCount > 1 ? "s" : ""}`
                : `Connect ${newSelectionCount} account${newSelectionCount !== 1 ? "s" : ""}`}
        </Button>

        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="mt-3 w-full py-2 text-xs text-white/35 transition-colors hover:text-white/60"
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
