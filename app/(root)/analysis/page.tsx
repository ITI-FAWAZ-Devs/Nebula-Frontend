"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";
import { AnalysisTimeline } from "@/components/analysis/AnalysisTimeline";
import { LiveLogs } from "@/components/analysis/LiveLogs";
import { AgentConstellation } from "@/components/analysis/AgentConstellation";
import { CompleteOverlay } from "@/components/analysis/CompleteOverlay";
import { STEPS, AGENTS } from "@/components/analysis/constants";
import { LogLine } from "@/components/analysis/types";
import { useLaunchPipeline } from "@/hooks/use-launch";

const ANALYSIS_STAGES = [
  "queued",
  "starting",
  "workspace",
  "clone",
  "discovery",
  "graphify",
  "normalize",
  "build_graph",
  "save_neo4j",
  "done",
];

const DOC_STAGES = [
  "queued",
  "starting",
  "workspace",
  "clone",
  "discovery",
  "describe_files",
  "embed_descriptions",
  "save_chroma",
  "done",
];

const ARCH_ACTIVE = ["PENDING", "RETRIEVING", "GENERATING", "VERIFYING"];

function rank(stage: string | null, order: string[]): number {
  if (!stage) return -1;
  const idx = order.indexOf(stage);
  return idx === -1 ? order.length : idx;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ts() {
  const now = new Date();
  return `${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds())}`;
}

function AnalysisMissionControl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repoId");
  const repo = searchParams.get("repo");

  const { analysis, documentation, archDoc, phase, error, startPipeline } =
    useLaunchPipeline(repoId);

  const [logLines, setLogLines] = useState<LogLine[]>([]);

  const prevAnalysisStage = useRef<string | null>(null);
  const prevDocStage = useRef<string | null>(null);
  const prevArchStatus = useRef<string | null>(null);

  const pushLog = useCallback((step: string, line: string) => {
    setLogLines((prev) => [...prev, { step, line, t: ts() }].slice(-40));
  }, []);

  const complete = phase === "docs-ready";

  useEffect(() => {
    if (repoId) {
      const t = setTimeout(() => pushLog("pipeline", "igniting analysis engines"), 0);
      startPipeline();
      return () => clearTimeout(t);
    }
  }, [repoId, startPipeline, pushLog]);

  useEffect(() => {
    if (phase === "docs-ready") {
      const t = setTimeout(() => {
        router.push(
          `/workspace?repoId=${repoId}&repo=${encodeURIComponent(repo ?? "")}`
        );
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [phase, repoId, repo, router]);

  useEffect(() => {
    const stage = analysis?.stage ?? null;
    if (stage && stage !== prevAnalysisStage.current) {
      prevAnalysisStage.current = stage;
      pushLog("analysis", stage);
    }
  }, [analysis, pushLog]);

  useEffect(() => {
    const stage = documentation?.stage ?? null;
    if (stage && stage !== prevDocStage.current) {
      prevDocStage.current = stage;
      pushLog("documentation", stage);
    }
  }, [documentation, pushLog]);

  useEffect(() => {
    const status = archDoc?.status ?? null;
    if (status && status !== prevArchStatus.current) {
      prevArchStatus.current = status;
      pushLog("arch-doc", status.toLowerCase());
    }
  }, [archDoc, pushLog]);

  const analysisRank = rank(analysis?.stage ?? null, ANALYSIS_STAGES);
  const docRank = rank(documentation?.stage ?? null, DOC_STAGES);

  const done = useMemo(() => {
    const set = new Set<string>();
    if (analysisRank >= rank("clone", ANALYSIS_STAGES)) set.add("clone");
    if (analysisRank >= rank("discovery", ANALYSIS_STAGES)) set.add("parse");
    if (analysisRank >= rank("graphify", ANALYSIS_STAGES)) set.add("ast");
    if (analysisRank >= rank("build_graph", ANALYSIS_STAGES)) set.add("graph");
    if (docRank >= rank("describe_files", DOC_STAGES)) set.add("embed");
    if (docRank >= rank("embed_descriptions", DOC_STAGES)) set.add("rag");
    if (archDoc?.status === "COMPLETED") set.add("agents");
    return set;
  }, [analysisRank, docRank, archDoc?.status]);

  const failed = useMemo(() => {
    const set = new Set<string>();
    if (analysis?.status === "FAILED") {
      for (const id of ["clone", "parse", "ast", "graph"]) {
        if (!done.has(id)) {
          set.add(id);
          break;
        }
      }
    }
    if (documentation?.status === "FAILED") {
      for (const id of ["embed", "rag"]) {
        if (!done.has(id)) {
          set.add(id);
          break;
        }
      }
    }
    if (archDoc?.status === "FAILED" && !done.has("agents")) {
      set.add("agents");
    }
    return set;
  }, [analysis?.status, documentation?.status, archDoc?.status, done]);

  const current = useMemo(() => {
    if (phase === "idle" || phase === "docs-ready" || phase === "error") {
      return STEPS.length;
    }
    const idx = STEPS.findIndex((s) => !done.has(s.id) && !failed.has(s.id));
    return idx === -1 ? STEPS.length : idx;
  }, [phase, done, failed]);

  const agentsOnline = useMemo(
    () =>
      !!archDoc &&
      (archDoc.status === "COMPLETED" || ARCH_ACTIVE.includes(archDoc.status)),
    [archDoc]
  );

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground pt-28 pb-16 px-4 sm:px-6 bg-background">
      <NebulaBackdrop />

      {/* header title info */}
      <div className="relative z-10 mx-auto max-w-7xl px-2 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-white tracking-tight">
            Mission Control
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Real-time compilation and agent ingestion sequence
          </p>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary bg-white/5 px-4 py-2 border border-white/10 rounded-full w-fit">
          Payload: {repo ?? "No repository selected"}
        </div>
      </div>

      {phase === "error" && error && (
        <div className="relative z-10 mx-auto max-w-7xl px-2 mb-6 flex flex-col gap-3 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="h-4 w-4 flex-none text-rose-400" />
            <span className="truncate font-mono text-xs text-rose-300">{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => startPipeline()}
            className="flex-none cursor-pointer text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-2 pb-16 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT: Timeline */}
        <AnalysisTimeline
          steps={STEPS}
          current={current}
          done={done}
          failed={failed}
          complete={complete}
        />

        {/* RIGHT: Logs + Agents */}
        <section className="flex flex-col gap-6">
          <LiveLogs logLines={logLines} />
          <AgentConstellation agents={AGENTS} online={agentsOnline} />
        </section>
      </main>

      {/* Complete overlay */}
      <CompleteOverlay complete={complete} />
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnalysisMissionControl />
    </Suspense>
  );
}
