"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

type Planet = {
  name: string;
  angle: number;
  radius: number;
  size: number;
  color: string;
  health: number;
  ring?: boolean;
};

const PLANETS: Planet[] = [
  { name: "Auth", angle: 20, radius: 130, size: 22, color: "oklch(0.72 0.18 260)", health: 98, ring: true },
  { name: "Users", angle: 80, radius: 175, size: 28, color: "oklch(0.82 0.14 210)", health: 96 },
  { name: "Orders", angle: 140, radius: 220, size: 34, color: "oklch(0.65 0.22 300)", health: 92, ring: true },
  { name: "Payments", angle: 205, radius: 155, size: 26, color: "oklch(0.72 0.2 340)", health: 99 },
  { name: "Notifications", angle: 270, radius: 200, size: 20, color: "oklch(0.78 0.16 200)", health: 88 },
  { name: "Analytics", angle: 325, radius: 245, size: 30, color: "oklch(0.68 0.2 280)", health: 94, ring: true },
];

export function HeroGalaxy() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const size = 560;
  const center = size / 2;

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, maxWidth: "100%" }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.72 0.18 265 / 0.35), transparent 60%)",
          filter: "blur(30px)",
        }}
      />

      {/* Orbit rings */}
      <div className="absolute inset-0 animate-spin-slow">
        {[130, 175, 200, 245].map((r) => (
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
          <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.95 0.05 250)" />
            <stop offset="50%" stopColor="oklch(0.72 0.18 260)" />
            <stop offset="100%" stopColor="oklch(0.4 0.15 280 / 0)" />
          </radialGradient>
          <linearGradient id="line-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.14 210 / 0.8)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 300 / 0.2)" />
          </linearGradient>
        </defs>

        {PLANETS.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = center + Math.cos(rad) * p.radius;
          const y = center + Math.sin(rad) * p.radius;
          return (
            <motion.line
              key={p.name}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="url(#line-grad)"
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={visible ? { pathLength: 1, opacity: 0.7 } : {}}
              transition={{ delay: 0.4 + i * 0.12, duration: 1 }}
              className="animate-dash-flow"
            />
          );
        })}

        {/* Cross-module links */}
        {[
          [0, 3],
          [1, 4],
          [2, 5],
          [0, 2],
        ].map(([a, b], i) => {
          const pa = PLANETS[a];
          const pb = PLANETS[b];
          const ra = (pa.angle * Math.PI) / 180;
          const rb = (pb.angle * Math.PI) / 180;
          return (
            <motion.line
              key={`x-${i}`}
              x1={center + Math.cos(ra) * pa.radius}
              y1={center + Math.sin(ra) * pa.radius}
              x2={center + Math.cos(rb) * pb.radius}
              y2={center + Math.sin(rb) * pb.radius}
              stroke="oklch(0.65 0.22 300 / 0.25)"
              strokeWidth={0.8}
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : {}}
              transition={{ delay: 1.4 + i * 0.15, duration: 0.8 }}
            />
          );
        })}
      </svg>

      {/* Core */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{ left: center - 40, top: center - 40, width: 80, height: 80 }}
      >
        <div
          className="relative h-full w-full rounded-full animate-pulse-glow"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, white, oklch(0.72 0.18 265) 60%, oklch(0.45 0.2 285))",
            boxShadow:
              "0 0 60px oklch(0.72 0.18 265 / 0.9), 0 0 120px oklch(0.65 0.22 300 / 0.5)",
          }}
        />
      </motion.div>

      {/* Planets */}
      <div className="absolute inset-0 animate-spin-reverse-slow">
        {PLANETS.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = center + Math.cos(rad) * p.radius;
          const y = center + Math.sin(rad) * p.radius;
          return (
            <motion.div
              key={p.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={visible ? { scale: 1, opacity: 1 } : {}}
              transition={{
                delay: 0.6 + i * 0.15,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: "absolute",
                left: x - p.size,
                top: y - p.size,
                width: p.size * 2,
                height: p.size * 2,
              }}
              className="animate-float-y"
            >
              {/* counter-rotate label */}
              <div className="animate-spin-slow relative h-full w-full">
                {p.ring && (
                  <div
                    className="absolute inset-[-30%] rounded-full border"
                    style={{
                      borderColor: `${p.color.replace(")", " / 0.4)")}`,
                      transform: "rotateX(70deg)",
                    }}
                  />
                )}
                <div
                  className="relative h-full w-full rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, white, ${p.color} 70%, oklch(0.15 0.05 265))`,
                    boxShadow: `0 0 20px ${p.color.replace(")", " / 0.7)")}, inset -4px -6px 12px oklch(0 0 0 / 0.5)`,
                  }}
                />
                {/* health dot */}
                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full animate-pulse-glow"
                  style={{
                    background:
                      p.health > 95
                        ? "oklch(0.75 0.2 145)"
                        : p.health > 90
                          ? "oklch(0.82 0.16 90)"
                          : "oklch(0.7 0.22 25)",
                  }}
                />
              </div>

              {/* Label */}
              <div
                className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-white/70"
                style={{ animation: "none" }}
              >
                {p.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
