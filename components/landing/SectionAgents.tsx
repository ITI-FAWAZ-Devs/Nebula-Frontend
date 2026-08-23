"use client";

import { motion } from "motion/react";
import { FileCode2, Layers, Network, ShieldCheck } from "lucide-react";
import { SectionEyebrow } from "./SectionEyebrow";
import { SplineSceneBasic } from "./SplineSceneDemo";

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
    <section id="agents" className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-[90rem] px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionEyebrow>AI Engineering Team</SectionEyebrow>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Meet your <span className="text-gradient">AI engineering team.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              A crew of specialized autonomous agents that live inside your repository, each one focused on analyzing and optimizing a core slice of your software system.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {agents.map((a, i) => (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div
                    className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${a.accent.replace(")", " / 0.25)")}, transparent)`,
                      border: `1px solid ${a.accent.replace(")", " / 0.3)")}`,
                    }}
                  >
                    <a.icon className="h-5 w-5" style={{ color: a.accent }} />
                  </div>
                  <h3 className="font-display text-base font-medium text-white">
                    {a.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                    {a.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#07090E]/90 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
            <SplineSceneBasic />
          </div>
        </div>
      </div>
    </section>
  );
}
