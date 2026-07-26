"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Starfield } from "./Starfield";

const BOOT_STEPS = [
  "Initializing AI Command Center...",
  "Connecting to GitHub...",
  "Repository Detected...",
  "Parsing Source Code...",
  "Building Dependency Graph...",
  "Initializing AI Agents...",
  "Generating Knowledge Graph...",
  "Launching Nebula...",
];

interface BootSequenceProps {
  onDone: () => void;
}

export function BootSequence({ onDone }: BootSequenceProps) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const perStep = 620;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // dot -> nebula reveal delay
    timers.push(setTimeout(() => setStepIndex(0), 1100));
    for (let i = 1; i < BOOT_STEPS.length; i++) {
      timers.push(setTimeout(() => setStepIndex(i), 1100 + i * perStep));
    }
    // progress
    const start = performance.now();
    const total = 1100 + BOOT_STEPS.length * perStep;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / total) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // flash + finish
    timers.push(setTimeout(() => setFlash(true), total + 250));
    timers.push(setTimeout(() => onDone(), total + 900));
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Nebula reveal */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-[80vmin] w-[80vmin] rounded-full"
          style={{
            background: "#4493F8",
            filter: "blur(80px)",
            opacity: 0.2,
          }}
        />
      </motion.div>

      {/* Center glowing dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 1], opacity: [0, 1, 0.9] }}
        transition={{ duration: 1.3, times: [0, 0.4, 1] }}
        className="absolute h-3 w-3 rounded-full bg-white glow-blue"
      />

      <Starfield count={80} />

      {/* Terminal / progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: stepIndex >= 0 ? 1 : 0, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-6 w-full max-w-xl font-mono"
      >
        <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-primary/80">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          Nebula OS
        </div>
        <div className="space-y-1.5 text-sm text-white/70">
          {BOOT_STEPS.map((line, i) => {
            const active = i <= stepIndex;
            const done = i < stepIndex;
            return (
              <div
                key={line}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              >
                <span
                  className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    done
                      ? "bg-primary/20 text-primary"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {done ? "✓" : i === stepIndex ? "›" : ""}
                </span>
                <span className="tabular-nums text-white/40">
                  [{String(i + 1).padStart(2)}]
                </span>
                <span
                  className={
                    done ? "text-white/90" : "text-white/75"
                  }
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-[11px] tracking-widest text-white/50">
            <span>BOOT PROGRESS</span>
            <span className="tabular-nums">
              {String(Math.floor(progress)).padStart(3)}%
            </span>
          </div>
          <div className="h-0.75 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: "#4493F8",
                boxShadow: "0 0 16px #4493F8cc",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/70"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
