"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Database, Loader2, Rocket } from "lucide-react";
import { ArchitectureWiki } from "@/components/workspace/ArchitectureWiki";
import { Button } from "@/components/ui/button";
import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  useArchDocVersionsQuery,
  useArchDocVersionQuery,
  useRegenerateMutation,
  isActiveArchDocStatus,
} from "@/hooks/use-arch-doc";
import { useRepositoryQuery } from "@/hooks/use-repository";

function WorkspaceView() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repoId");
  const repo = searchParams.get("repo") || "repository";

  const [pickedVersion, setPickedVersion] = useState<number | null>(null);
  const [knownLatest, setKnownLatest] = useState<number | null>(null);

  const { data: versions, isLoading: versionsLoading } = useArchDocVersionsQuery(repoId);
  const { data: repository } = useRepositoryQuery(repoId);

  const completedVersions = useMemo(
    () => (versions || []).filter((v) => v.status === "COMPLETED"),
    [versions]
  );
  const latestVersion = completedVersions[0]?.version ?? null;
  const activeVersion = useMemo(
    () => (versions || []).find((v) => isActiveArchDocStatus(v.status)) ?? null,
    [versions]
  );

  // Documented "adjusting state during render" pattern:
  // seed the known latest once versions load, and auto-switch to Latest when a
  // regeneration completes (i.e. a newer version appears in the history).
  if (latestVersion !== null && knownLatest === null) {
    setKnownLatest(latestVersion);
  } else if (
    latestVersion !== null &&
    knownLatest !== null &&
    latestVersion > knownLatest
  ) {
    setKnownLatest(latestVersion);
    setPickedVersion(null);
  }

  const selectedVersion = pickedVersion ?? latestVersion;

  const { data, isLoading, isError, error, refetch } = useArchDocVersionQuery(
    repoId,
    selectedVersion
  );

  const regenerateMutation = useRegenerateMutation();

  const handleRegenerate = async () => {
    if (!repoId) return;
    try {
      const result = await regenerateMutation.mutateAsync(repoId);
      if (!result.needsRegeneration) {
        toast.info("No new changes to regenerate");
      }
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "Failed to regenerate"
      );
    }
  };

  if (data && selectedVersion !== null) {
    return (
      <div className="h-screen w-full overflow-hidden text-foreground">
        <ArchitectureWiki
          repositoryId={repoId!}
          repository={repository}
          data={data}
          repoName={repo}
          versions={completedVersions}
          activeVersion={activeVersion}
          selectedVersion={selectedVersion}
          onVersionChange={setPickedVersion}
          onRegenerate={handleRegenerate}
          isRegenerating={!!activeVersion}
        />
      </div>
    );
  }

  if (!repoId) {
    return <EmptyState />;
  }

  if (versionsLoading || isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <NebulaBackdrop />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading architecture document...
          </span>
        </div>
      </div>
    );
  }

  if (completedVersions.length === 0) {
    return <EmptyState />;
  }

  if (isError && (error as { response?: { status?: number } })?.response?.status !== 404) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <NebulaBackdrop />
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="max-w-md text-xs text-muted-foreground">
            {(error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ||
              (error as Error)?.message ||
              "Failed to load the architecture document."}
          </p>
          <Button
            variant="ghost"
            className="mt-3 cursor-pointer text-primary"
            onClick={() => refetch()}
          >
            Retry Fetch
          </Button>
        </div>
      </div>
    );
  }

  return <EmptyState />;
}

function EmptyState() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <NebulaBackdrop />
      <Empty className="relative z-10 mx-auto max-w-md py-24">
        <EmptyHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/5 text-muted-foreground">
            <Database className="h-6 w-6" />
          </div>
          <EmptyTitle className="text-base text-white">
            No architecture document yet
          </EmptyTitle>
          <EmptyDescription className="mt-1 max-w-sm text-muted-foreground">
            Launch a repository to generate its architecture documentation.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/launch">
            <Button
              className="mt-3 cursor-pointer rounded-full px-6 font-mono text-xs uppercase tracking-widest text-white"
              style={{
                background: "#4493F8",
                boxShadow: "0 4px 16px -4px #4493F899",
              }}
            >
              <Rocket className="h-3.5 w-3.5" />
              Launch to Galaxy
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <WorkspaceView />
    </Suspense>
  );
}
