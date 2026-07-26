"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";
import { AnalysisTimeline } from "@/components/analysis/AnalysisTimeline";
import { LiveLogs } from "@/components/analysis/LiveLogs";
import { AgentConstellation } from "@/components/analysis/AgentConstellation";
import { CompleteOverlay } from "@/components/analysis/CompleteOverlay";
import { STEPS, AGENTS } from "@/components/analysis/constants";
import { LogLine } from "@/components/analysis/types";

export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo");

  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (current >= STEPS.length) {
      setComplete(true);
      const t = setTimeout(() => {
        router.push("/workspace");
      }, 2200);
      return () => clearTimeout(t);
    }

    const step = STEPS[current];
    const logTimers = step.logs.map((line, i) =>
      setTimeout(() => {
        const now = new Date();
        const t = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
        setLogLines(prev => [...prev, { step: step.id, line, t }].slice(-40));
      }, (step.duration / (step.logs.length + 1)) * (i + 1))
    );

    const advance = setTimeout(() => {
      setDone(prev => new Set(prev).add(step.id));
      setCurrent(c => c + 1);
    }, step.duration);

    return () => {
      logTimers.forEach(clearTimeout);
      clearTimeout(advance);
    };
  }, [current, router]);

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground pt-28 pb-16 px-4 sm:px-6 bg-background">
      <NebulaBackdrop />

      {/* header title info */}
      <div className="relative z-10 mx-auto max-w-7xl px-2 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-white tracking-tight">Mission Control</h1>
          <p className="text-sm text-white/50 mt-1">Real-time compilation and agent ingestion sequence</p>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary bg-white/5 px-4 py-2 border border-white/10 rounded-full w-fit">
          Payload: {repo ?? "acme/orion-core"}
        </div>
      </div>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-2 pb-16 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT: Timeline */}
        <AnalysisTimeline 
          steps={STEPS} 
          current={current} 
          done={done} 
          complete={complete} 
        />

        {/* RIGHT: Logs + Agents */}
        <section className="flex flex-col gap-6">
          <LiveLogs logLines={logLines} />
          <AgentConstellation 
            agents={AGENTS} 
            online={done.has("agents")} 
          />
        </section>
      </main>

      {/* Complete overlay */}
      <CompleteOverlay complete={complete} />
    </div>
  );
}
