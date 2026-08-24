"use client";

import React from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import type { ResearchProgress } from "@/hooks/use-agent-chat";

interface DeepResearchProgressProps {
  progress: ResearchProgress | null;
}

export function DeepResearchProgress({ progress }: DeepResearchProgressProps) {
  if (!progress) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 rounded-xl border border-purple-500/20 bg-purple-950/20 px-3.5 py-3 text-xs my-2"
    >
      <div className="flex items-center gap-2 font-medium text-purple-300">
        <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
        <span>
          Deep Research — Step {progress.step} of {progress.total}
        </span>
      </div>

      <div className="flex items-start gap-2.5 text-white/80 pl-1">
        <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin shrink-0 mt-0.5" />
        <p className="leading-relaxed text-xs">{progress.subQuestion}</p>
      </div>
    </motion.div>
  );
}

export function ModeBadge({ mode }: { mode: "fast" | "standard" | "deep" | null }) {
  if (!mode) return null;

  switch (mode) {
    case "fast":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          ⚡ Fast Answer
        </span>
      );
    case "deep":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
          🔬 Deep Research
        </span>
      );
    case "standard":
    default:
      return null;
  }
}
