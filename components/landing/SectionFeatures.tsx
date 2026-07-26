"use client";

import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  FileCode2,
  GitBranch,
  Network,
  Radar,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { SectionEyebrow } from "./SectionEyebrow";

export function SectionFeatures() {
  const features = [
    { name: "Interactive Software Map", icon: Radar },
    { name: "Architecture Intelligence", icon: Brain },
    { name: "Automatic Documentation", icon: FileCode2 },
    { name: "Dependency Graph", icon: Network },
    { name: "AI Agents", icon: Bot },
    { name: "Codebase Chat", icon: Sparkles },
    { name: "Drift Detection", icon: Activity },
    { name: "Impact Analysis", icon: Zap },
    { name: "GitHub Integration", icon: GitBranch },
    { name: "RAG-powered Search", icon: Search },
  ];

  return (
    <section className="relative py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Capabilities</SectionEyebrow>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            One command center.{" "}
            <span className="text-gradient">Every superpower.</span>
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/6 bg-white/4 md:grid-cols-3 lg:grid-cols-5">
          {features.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="group relative flex flex-col items-start gap-5 bg-background p-6 transition-colors hover:bg-white/2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 transition-all group-hover:border-primary/40 group-hover:shadow-[0_0_24px_oklch(0.72_0.18_265/0.5)]">
                <f.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="font-display text-[15px] leading-tight text-white/90">
                {f.name}
              </div>
              <ArrowRight className="mt-auto h-4 w-4 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-primary" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
