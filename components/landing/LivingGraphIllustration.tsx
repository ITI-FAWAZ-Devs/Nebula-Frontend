"use client";

import { motion } from "motion/react";
import { GitBranch } from "lucide-react";

export function LivingGraphIllustration() {
  const nodes = [
    { x: 60, y: 80 },
    { x: 180, y: 50 },
    { x: 300, y: 100 },
    { x: 120, y: 180 },
    { x: 240, y: 200 },
    { x: 340, y: 220 },
    { x: 200, y: 300 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 3],
    [3, 4],
    [2, 4],
    [4, 5],
    [3, 6],
    [4, 6],
  ];

  return (
    <div className="relative aspect-4/3 w-full overflow-hidden glass-panel">
      <div className="absolute inset-0 nebula-bg opacity-40" />
      <svg viewBox="0 0 400 360" className="relative h-full w-full">
        <defs>
          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.14 210 / 0.7)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 300 / 0.3)" />
          </linearGradient>
        </defs>
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#edge)"
            strokeWidth={1.2}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 1.2 }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={6 + (i % 3) * 2}
            fill="oklch(0.72 0.18 265)"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            style={{
              filter:
                "drop-shadow(0 0 8px oklch(0.72 0.18 265 / 0.9))",
              transformOrigin: `${n.x}px ${n.y}px`,
            }}
          />
        ))}
      </svg>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60">
        <GitBranch className="h-3 w-3" /> commit 4a1c9e2 — arch delta +3
      </div>
    </div>
  );
}
