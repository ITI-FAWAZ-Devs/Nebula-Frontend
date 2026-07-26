"use client";

import { motion } from "motion/react";
import { DrawerShell } from "./DrawerShell";

interface HistoryTimelineProps {
  open: boolean;
  onClose: () => void;
}

const EVENTS = [
  { t: "just now", who: "Documentarian", what: "Regenerated docs for pulsar-api after signature change." },
  { t: "2m ago", who: "Sentinel", what: "Detected a possible regression in helios-ml inference latency." },
  { t: "18m ago", who: "You", what: "Asked: how does orion-core route to andromeda-db?" },
  { t: "1h ago", who: "Architect", what: "Redrew dependency graph after quasar-ui refactor." },
  { t: "3h ago", who: "Cartographer", what: "Added helios-ml as a new planet in the galaxy." },
  { t: "yesterday", who: "You", what: "Launched acme/orion-core into Nebula." },
];

export function HistoryTimeline({ open, onClose }: HistoryTimelineProps) {
  return (
    <DrawerShell side="left" open={open} onClose={onClose} label="AI memory">
      <div className="border-b border-white/5 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">AI memory</div>
        <h3 className="mt-1 font-display text-2xl font-semibold text-white">Timeline</h3>
        <p className="mt-2 text-sm text-muted-foreground">Everything your Nebula agents have observed, remembered, and acted on.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <ol className="relative space-y-6 border-l border-white/10 pl-6">
          {EVENTS.map((e, i) => (
            <motion.li 
              key={i} 
              initial={{ opacity: 0, x: -8 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05 }}
            >
              <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_#4493F880]" />
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{e.t} · {e.who}</div>
              <div className="mt-1 text-sm text-white/90">{e.what}</div>
            </motion.li>
          ))}
        </ol>
      </div>
    </DrawerShell>
  );
}
