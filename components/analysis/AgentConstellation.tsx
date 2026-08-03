"use client";

import { motion } from "motion/react";
import { Bot, Sparkles } from "lucide-react";
import { Agent } from "./types";

interface AgentConstellationProps {
  agents: Agent[];
  online: boolean;
}

export function AgentConstellation({ agents, online }: AgentConstellationProps) {
  return (
    <div className="premium-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Agent constellation</div>
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {agents.map((a, i) => {
          return (
            <motion.div 
              key={a.name}
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 + i * 0.1 }}
              className="relative flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
            >
              <div 
                className="relative flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: `radial-gradient(circle, ${a.color}55, transparent 70%)` }}
              >
                <Bot className="h-4 w-4 text-white" />
                {online && <span className="absolute inset-0 animate-pulse-glow rounded-full" style={{ boxShadow: `0 0 5px ${a.color}` }} />}
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-medium text-white">{a.name}</div>
                <div className="truncate text-[10px] text-muted-foreground">{a.role}</div>
              </div>
              <span className={`ml-auto h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" : "bg-white/20"}`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
