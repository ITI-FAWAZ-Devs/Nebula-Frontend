"use client";

import { motion } from "motion/react";
import { Brain, FileCode2, Layers, ShieldCheck } from "lucide-react";

export function AgentsPanel() {
  const agents = [
    { name: "Structure Agent", status: "active", icon: Layers },
    { name: "Documentation Agent", status: "active", icon: FileCode2 },
    { name: "RAG Agent", status: "active", icon: Brain },
    { name: "Review Agent", status: "active", icon: ShieldCheck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="glass-panel w-70 p-5"
    >
      <div className="mb-4 flex items-center justify-between font-mono">
        <span className="text-[10px] uppercase tracking-[0.3em] text-nebula-purple">
          AI Agents
        </span>
        <span className="text-[10px] text-white/60">4 ACTIVE</span>
      </div>
      <ul className="space-y-2">
        {agents.map((a, i) => (
          <li
            key={a.name}
            className="group flex items-center gap-3 rounded-md border border-white/4 bg-white/2 px-3 py-2.5 transition-colors hover:bg-white/5"
          >
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-md"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 265 / 0.2), oklch(0.65 0.22 300 / 0.2))",
              }}
            >
              <a.icon className="h-4 w-4 text-nebula-cyan" />
              <span
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full animate-pulse-glow"
                style={{
                  background: "oklch(0.75 0.2 145)",
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white/90">{a.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                {a.status}
              </div>
            </div>
            <div className="flex h-4 items-end gap-0.5">
              {[3, 6, 4, 8, 5].map((h, k) => (
                <span
                  key={k}
                  className="w-0.5 rounded-full bg-nebula-cyan/70 animate-pulse-glow"
                  style={{ height: h, animationDelay: `${k * 0.15}s` }}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
