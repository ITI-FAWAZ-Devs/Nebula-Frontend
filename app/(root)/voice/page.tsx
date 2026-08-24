"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceAgentPage } from "@/components/voice/VoiceAgentPage";
import { useRepositoryQuery } from "@/hooks/use-repository";
import { useOrganizationsQuery } from "@/hooks/use-organization";
import { useAuthStore, useWorkspaceStore } from "@/lib/store";

function VoiceView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repoId");
  const repoName = searchParams.get("repo") ?? "repository";

  const { workspace } = useWorkspaceStore();
  const activeOrgId = workspace.type === "organization" ? workspace.organizationId : null;
  const user = useAuthStore((s) => s.user);
  const { data: orgs } = useOrganizationsQuery();

  const currentOrg = activeOrgId ? orgs?.find((o) => o.id === activeOrgId) : null;
  const isOwner = !!user && !!currentOrg && currentOrg.ownerId === user.id;
  const roleName = currentOrg?.userRole?.name ?? "";
  const isViewerOnly = !!activeOrgId && !isOwner && roleName === "Viewer";

  const { data: repository } = useRepositoryQuery(repoId);

  useEffect(() => {
    if (!repoId) {
      toast.error("No repository selected");
      router.replace("/launch");
      return;
    }
    if (isViewerOnly) {
      toast.error("Viewers are not authorized to use the Voice Agent");
      router.replace(
        `/workspace?repoId=${repoId}&repo=${encodeURIComponent(repoName)}`
      );
    }
  }, [repoId, isViewerOnly, repoName, router]);

  if (!repoId || isViewerOnly) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400/60" />
      </div>
    );
  }

  return (
    <VoiceAgentPage
      repositoryId={repoId}
      repository={repository}
      repoName={repoName}
    />
  );
}

export default function VoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-black">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400/60" />
        </div>
      }
    >
      <VoiceView />
    </Suspense>
  );
}
