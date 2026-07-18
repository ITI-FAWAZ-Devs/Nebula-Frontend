"use client";

import { Planet } from "./types";

interface GalaxyProps {
  planets: Planet[];
  selected: string | null;
}

export function Galaxy({ planets, selected }: GalaxyProps) {
  const byId = Object.fromEntries(planets.map(p => [p.id, p]));
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs>
        {planets.map(p => (
          <radialGradient key={p.id} id={`g-${p.id}`}>
            <stop offset="0%" stopColor={p.color} stopOpacity="0.9" />
            <stop offset="60%" stopColor={p.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="soft"><feGaussianBlur stdDeviation="0.4" /></filter>
      </defs>

      {/* Connections */}
      {planets.flatMap(p => p.deps.map(d => {
        const t = byId[d]; if (!t) return null;
        const key = `${p.id}-${d}`;
        const active = selected === p.id || selected === d;
        return (
          <line key={key} x1={p.x} y1={p.y} x2={t.x} y2={t.y}
            stroke={active ? "url(#gradline)" : "rgba(255,255,255,0.12)"}
            strokeWidth={active ? 0.25 : 0.12}
            className={active ? "animate-dash-flow" : ""}
          />
        );
      }))}
      <linearGradient id="gradline" x1="0" x2="1">
        <stop offset="0%" stopColor="var(--nebula-blue)" />
        <stop offset="100%" stopColor="var(--nebula-pink)" />
      </linearGradient>
    </svg>
  );
}
