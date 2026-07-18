"use client";

import { motion } from "motion/react";
import { Planet } from "./types";

interface PlanetNodeProps {
  p: Planet;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

export function PlanetNode({ p, selected, onSelect, index }: PlanetNodeProps) {
  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${p.x}%`, top: `${p.y}%` }}
    >
      {/* halo */}
      <span className="absolute inset-0 animate-pulse-glow rounded-full"
        style={{ background: `radial-gradient(circle, ${p.color}66, transparent 70%)`, width: p.r * 3, height: p.r * 3, left: -p.r * 1.5, top: -p.r * 1.5 }} />
      {/* orbit ring when selected */}
      {selected && (
        <motion.span
          className="absolute rounded-full border border-white/30"
          style={{ width: p.r * 2.4, height: p.r * 2.4, left: -p.r * 1.2, top: -p.r * 1.2 }}
          animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className="relative block rounded-full"
        style={{
          width: p.r, height: p.r,
          background: `radial-gradient(circle at 30% 30%, white, ${p.color} 55%, black 130%)`,
          boxShadow: `0 0 ${p.r}px ${p.color}, inset -4px -6px ${p.r / 2}px rgba(0,0,0,0.5)`,
        }} />
      <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-center">
        <span className="block font-display text-xs font-medium text-white">{p.name}</span>
        <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{p.kind}</span>
      </span>
    </motion.button>
  );
}
