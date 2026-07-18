"use client";

import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { LogLine } from "./types";

interface LiveLogsProps {
  logLines: LogLine[];
}

export function LiveLogs({ logLines }: LiveLogsProps) {
  return (
    <div className="premium-panel flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-nebula-cyan" />
          Live event stream
        </div>
        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="h-[320px] overflow-y-auto p-5 font-mono text-[11px] leading-relaxed scrollbar-thin">
        <AnimatePresence initial={false}>
          {logLines.map((l, i) => (
            <motion.div 
              key={i + l.t + l.line}
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 text-muted-foreground"
            >
              <span className="text-white/30">{l.t}</span>
              <span className="uppercase tracking-widest text-nebula-cyan/80">[{l.step}]</span>
              <span className="text-foreground/80">{l.line}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
