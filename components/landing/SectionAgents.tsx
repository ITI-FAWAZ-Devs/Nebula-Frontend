"use client";

import { motion } from "motion/react";
import { FileCode2, Layers, Network, ShieldCheck } from "lucide-react";
import { SectionEyebrow } from "./SectionEyebrow";

export function SectionAgents() {
  const agents = [
    {
      name: "Structure Agent",
      icon: Layers,
      desc: "Maps modules, services and boundaries in real time.",
      accent: "oklch(0.82 0.14 210)",
    },
    {
      name: "Documentation Agent",
      icon: FileCode2,
      desc: "Writes and rewrites docs alongside every commit.",
      accent: "oklch(0.72 0.18 260)",
    },
    {
      name: "Review Agent",
      icon: ShieldCheck,
      desc: "Flags drift, risk and architectural regressions.",
      accent: "oklch(0.72 0.2 340)",
    },
    {
      name: "Architecture Agent",
      icon: Network,
      desc: "Reasons about design decisions across the codebase.",
      accent: "oklch(0.65 0.22 300)",
    },
  ];

  return (
    <section id="agents" className="relative py-40">
      <div className="mx-auto max-w-[90rem] px-6">
        <div className="max-w-3xl">
          <SectionEyebrow>AI Engineering Team</SectionEyebrow>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Meet your{" "}
            <span className="text-gradient">AI engineering team.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/60">
            A crew of specialized agents that live inside your repository,
            each one focused on a slice of the system.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="group relative premium-panel overflow-hidden p-6 transition-transform duration-500 hover:-translate-y-1"
            >
              <div
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70"
                style={{ background: a.accent }}
              />
              <div
                className="relative mb-6 flex h-11 w-11 items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${a.accent.replace(")", " / 0.25)")}, transparent)`,
                  border: `1px solid ${a.accent.replace(")", " / 0.3)")}`,
                }}
              >
                <a.icon className="h-5 w-5" style={{ color: a.accent }} />
              </div>
              <h3 className="font-display text-lg font-medium text-white">
                {a.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {a.desc}
              </p>
              <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                Online
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
