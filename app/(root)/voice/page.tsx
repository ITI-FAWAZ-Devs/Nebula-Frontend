"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { VoiceAgentPage } from "@/components/voice/VoiceAgentPage";
import { useRepositoryQuery } from "@/hooks/use-repository";

function VoiceView() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repoId");
  const repoName = searchParams.get("repo") ?? "repository";

  const { data: repository } = useRepositoryQuery(repoId);

  if (!repoId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <p className="font-mono text-xs uppercase tracking-widest text-white/30">
          No repository selected
        </p>
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
