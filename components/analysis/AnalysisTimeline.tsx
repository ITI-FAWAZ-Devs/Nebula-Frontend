"use client";

import { motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Step } from "./types";

interface AnalysisTimelineProps {
  steps: Step[];
  current: number;
  done: Set<string>;
  complete: boolean;
}

export function AnalysisTimeline({ steps, current, done, complete }: AnalysisTimelineProps) {
  const progress = (done.size / steps.length) * 100;

  return (
    <section className="premium-panel p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Analysis timeline</div>
          <h2 className="mt-1 font-display text-2xl font-semibold text-white">Bringing your galaxy online</h2>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl tabular-nums text-gradient">{Math.round(progress)}%</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">complete</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="relative mb-8 h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-nebula-blue via-nebula-purple to-nebula-pink"
          animate={{ width: `${progress}%` }} 
          transition={{ ease: "easeOut" }} 
        />
      </div>

      <ol className="space-y-3">
        {steps.map((s, i) => {
          const isDone = done.has(s.id);
          const isActive = i === current && !complete;
          const Icon = s.icon;
          return (
            <motion.li 
              key={s.id}
              initial={{ opacity: 0, x: -12 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                isActive ? "border-nebula-purple/40 bg-white/[0.04]" : isDone ? "border-white/10 bg-white/[0.02]" : "border-white/5"
              }`}
            >
              <div className={`relative mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg ${isDone ? "bg-nebula-blue/20 text-nebula-cyan" : isActive ? "bg-nebula-purple/20 text-white" : "bg-white/5 text-muted-foreground"}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {isActive && <span className="absolute inset-0 animate-pulse-glow rounded-lg ring-2 ring-nebula-purple/40" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className={`font-display text-sm font-medium ${isDone || isActive ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {isDone ? "done" : isActive ? "running" : "queued"}
                  </div>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.detail}</div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
