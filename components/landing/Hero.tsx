"use client";

import { motion } from "motion/react";
import { ArrowRight, Bot, GitBranch, Layers, FileCode2 } from "lucide-react";
import { SplineSceneBasic } from "./SplineSceneDemo";
import { Button } from "../ui/button";
import { FiGithub } from "react-icons/fi";

const highlights = [
  { icon: Layers, label: "Live Architecture Maps", color: "oklch(0.82 0.14 210)" },
  { icon: Bot, label: "AI Engineering Agents", color: "oklch(0.72 0.18 260)" },
  { icon: FileCode2, label: "Auto-Generated Docs", color: "oklch(0.72 0.2 340)" },
  { icon: GitBranch, label: "GitHub-Native Workflow", color: "oklch(0.65 0.22 300)" },
];

const metrics = [
  { value: "10k+", label: "Docs Generated" },
  { value: "500+", label: "Engineering Teams" },
  { value: "99.9%", label: "Uptime" },
  { value: "<60s", label: "Setup Time" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden pb-10">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at 30% 50%, black 10%, transparent 60%)",
      }} />

      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-nebula-purple/[0.03] blur-[100px]" />

      <div className="relative mx-auto grid w-full max-w-[90rem] grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div className="flex flex-col items-start text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-[5rem]"
          >
            Your codebase,
            <br />
            documented by{" "}
            <span className="text-gradient">AI</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/70 sm:text-xl"
          >
            Connect your GitHub repo and Nebula&apos;s AI agents instantly
            generate and maintain your documentation. Architecture diagrams,
            API references, and module guides — all kept in sync with every
            commit, automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
                className="group flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06]"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${h.color}20, transparent)`,
                    border: `1px solid ${h.color}30`,
                  }}
                >
                  <h.icon className="h-4 w-4" style={{ color: h.color }} />
                </div>
                <span className="text-xs font-medium text-white/70 leading-tight">{h.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 flex flex-col items-start gap-4"
          >
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full px-7 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_10px_40px_-10px_oklch(0.72_0.18_265/0.9)] hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: "#4493F8",
                  boxShadow: "0 10px 40px -10px oklch(0.72 0.18 265 / 0.7)",
                }}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                <FiGithub className="h-4 w-4" />
                Connect GitHub
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="outline"
                className="inline-flex h-12 items-center gap-2 rounded-full border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-white/70 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white hover:-translate-y-0.5"
              >
                See How It Works
              </Button>
            </div>
            <p className="text-xs text-white/40">No credit card required &middot; Free for open source</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-[380px] sm:h-[450px] lg:h-[580px]"
        >
          <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/[0.07] via-transparent to-nebula-purple/[0.05] blur-xl" />
          <div className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
            <SplineSceneBasic />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm"
      >
        <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-6 px-6 py-5 sm:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="font-display text-2xl font-semibold text-white sm:text-3xl">
                {m.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
