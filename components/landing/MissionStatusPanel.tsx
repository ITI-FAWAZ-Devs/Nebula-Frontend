"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity, CheckCircle2, Circle } from "lucide-react";

export function MissionStatusPanel() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(iv);
  }, []);

  const steps = [
    { label: "Repository Connected", done: true },
    { label: "Analyzing Repository", done: progress >= 100 },
    { label: "Architecture Built", done: progress >= 100 },
    { label: "Dependency Graph Ready", done: progress >= 100 },
    { label: "Documentation Generated", done: progress >= 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="premium-panel w-70 p-5 font-mono text-xs"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
          Mission Status
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          LIVE
        </span>
      </div>
      <ul className="space-y-2.5">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-white/80">
            {s.done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Circle className="h-3.5 w-3.5 animate-pulse-glow text-nebula-blue" />
            )}
            <span className={s.done ? "" : "text-white/60"}>{s.label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] text-white/60">
          <span>ANALYSIS</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-0.75 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full transition-[width] duration-100"
            style={{
              width: `${progress}%`,
              background:
                "#4493F8",
            }}
          />
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-white/5 pt-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/50">
            Health Score
          </div>
          <div className="font-display text-3xl font-semibold text-gradient">
            96%
          </div>
        </div>
        <Activity className="h-8 w-8 text-gradient" />
      </div>
    </motion.div>
  );
}
