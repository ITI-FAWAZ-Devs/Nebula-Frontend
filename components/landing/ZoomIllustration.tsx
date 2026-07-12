"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Starfield } from "./Starfield";

type AuthNode = {
  name: string;
  kind: "module" | "function" | "service";
  angle: number;
  radius: number;
  size: number;
  color: string;
  health: number;
  ring?: boolean;
};

const AUTH_NODES: AuthNode[] = [
  { name: "JWT", kind: "module", angle: 30, radius: 90, size: 16, color: "oklch(0.82 0.14 210)", health: 99, ring: true },
  { name: "OAuth", kind: "service", angle: 95, radius: 120, size: 20, color: "oklch(0.72 0.18 260)", health: 96 },
  { name: "RBAC", kind: "module", angle: 155, radius: 100, size: 18, color: "oklch(0.65 0.22 300)", health: 92, ring: true },
  { name: "Sessions", kind: "service", angle: 215, radius: 130, size: 22, color: "oklch(0.72 0.2 340)", health: 98 },
  { name: "Guards", kind: "function", angle: 275, radius: 105, size: 15, color: "oklch(0.78 0.16 200)", health: 94 },
  { name: "Tokens", kind: "function", angle: 335, radius: 135, size: 17, color: "oklch(0.68 0.2 280)", health: 97, ring: true },
];

const CROSS_LINKS: [number, number][] = [
  [0, 3], // JWT ↔ Sessions
  [1, 2], // OAuth ↔ RBAC
  [4, 5], // Guards ↔ Tokens
  [0, 1], // JWT ↔ OAuth
];

const KIND_LABEL: Record<AuthNode["kind"], string> = {
  module: "mod",
  function: "fn",
  service: "svc",
};

export function ZoomIllustration() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const size = 360;
  const center = size / 2;

  return (
    <div className="relative aspect-square w-full overflow-hidden glass-panel">
      {/* Nebula backdrop */}
      <div className="absolute inset-0 nebula-bg opacity-60" />
      <Starfield count={40} />

      {/* Galaxy container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="relative"
          style={{ width: size, height: size, maxWidth: "100%" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, oklch(0.72 0.18 265 / 0.3), transparent 60%)",
              filter: "blur(20px)",
            }}
          />

          {/* Orbit rings */}
          <div className="absolute inset-0 animate-spin-slow">
            {[90, 105, 120, 135].map((r) => (
              <div
                key={r}
                className="absolute rounded-full border border-white/6"
                style={{
                  left: center - r,
                  top: center - r,
                  width: r * 2,
                  height: r * 2,
                }}
              />
            ))}
          </div>

          {/* Connection lines SVG */}
          <svg
            className="absolute inset-0"
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
          >
            <defs>
              <linearGradient id="zoom-line-grad" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.14 210 / 0.8)" />
                <stop offset="100%" stopColor="oklch(0.65 0.22 300 / 0.2)" />
              </linearGradient>
            </defs>

            {/* Radial lines from core */}
            {AUTH_NODES.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = center + Math.cos(rad) * node.radius;
              const y = center + Math.sin(rad) * node.radius;
              return (
                <motion.line
                  key={node.name}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="url(#zoom-line-grad)"
                  strokeWidth={0.8}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={visible ? { pathLength: 1, opacity: 0.6 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                  className="animate-dash-flow"
                />
              );
            })}

            {/* Cross-module links */}
            {CROSS_LINKS.map(([a, b], i) => {
              const pa = AUTH_NODES[a];
              const pb = AUTH_NODES[b];
              const ra = (pa.angle * Math.PI) / 180;
              const rb = (pb.angle * Math.PI) / 180;
              return (
                <motion.line
                  key={`cross-${i}`}
                  x1={center + Math.cos(ra) * pa.radius}
                  y1={center + Math.sin(ra) * pa.radius}
                  x2={center + Math.cos(rb) * pb.radius}
                  y2={center + Math.sin(rb) * pb.radius}
                  stroke="oklch(0.65 0.22 300 / 0.2)"
                  strokeWidth={0.6}
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2 + i * 0.12, duration: 0.7 }}
                />
              );
            })}
          </svg>

          {/* Core – Auth */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
            style={{
              left: center - 28,
              top: center - 28,
              width: 56,
              height: 56,
            }}
          >
            <div
              className="relative h-full w-full rounded-full animate-pulse-glow"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, white, oklch(0.72 0.18 265) 60%, oklch(0.45 0.2 285))",
                boxShadow:
                  "0 0 40px oklch(0.72 0.18 265 / 0.8), 0 0 80px oklch(0.65 0.22 300 / 0.4)",
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold uppercase tracking-[0.15em] text-white/90">
              Auth
            </span>
          </motion.div>

          {/* Orbiting nodes */}
          <div className="absolute inset-0 animate-spin-reverse-slow">
            {AUTH_NODES.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = center + Math.cos(rad) * node.radius;
              const y = center + Math.sin(rad) * node.radius;
              return (
                <motion.div
                  key={node.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={visible ? { scale: 1, opacity: 1 } : {}}
                  transition={{
                    delay: 0.5 + i * 0.12,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    position: "absolute",
                    left: x - node.size,
                    top: y - node.size,
                    width: node.size * 2,
                    height: node.size * 2,
                  }}
                  className="animate-float-y"
                >
                  {/* counter-rotate to keep labels upright */}
                  <div className="animate-spin-slow relative h-full w-full">
                    {node.ring && (
                      <div
                        className="absolute inset-[-30%] rounded-full border"
                        style={{
                          borderColor: `${node.color.replace(")", " / 0.35)")}`,
                          transform: "rotateX(70deg)",
                        }}
                      />
                    )}
                    <div
                      className="relative h-full w-full rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, white, ${node.color} 70%, oklch(0.15 0.05 265))`,
                        boxShadow: `0 0 14px ${node.color.replace(")", " / 0.6)")}, inset -3px -5px 10px oklch(0 0 0 / 0.5)`,
                      }}
                    />
                    {/* Health dot */}
                    <span
                      className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full animate-pulse-glow"
                      style={{
                        background:
                          node.health > 95
                            ? "oklch(0.75 0.2 145)"
                            : node.health > 90
                              ? "oklch(0.82 0.16 90)"
                              : "oklch(0.7 0.22 25)",
                      }}
                    />
                  </div>

                  {/* Label */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-center"
                    style={{ animation: "none" }}
                  >
                    <span className="block font-mono text-[8px] uppercase tracking-[0.15em] text-white/70">
                      {node.name}
                    </span>
                    <span className="block font-mono text-[7px] uppercase tracking-[0.1em] text-white/35">
                      {KIND_LABEL[node.kind]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom breadcrumb */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/60">
        <span>MODULE › auth</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.75_0.2_145)] animate-pulse-glow" />
          6 nodes online
        </span>
      </div>
    </div>
  );
}
