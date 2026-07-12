"use client";

import { motion } from "motion/react";
import { Boxes, FileCode2, GitBranch, ShieldCheck, Workflow } from "lucide-react";
import { SectionEyebrow } from "./SectionEyebrow";

export function SectionTimeline() {
  const events = [
    { t: "T0", label: "Repository Created", icon: GitBranch },
    { t: "T1", label: "Authentication Added", icon: ShieldCheck },
    { t: "T2", label: "Payments Added", icon: Boxes },
    { t: "T3", label: "OAuth Migration", icon: Workflow },
    { t: "T4", label: "Documentation Updated", icon: FileCode2 },
  ];

  return (
    <section className="relative py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Architecture Timeline</SectionEyebrow>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Every architectural{" "}
            <span className="text-gradient">moment,</span> remembered.
          </h2>
        </div>

        <div className="relative mt-20">
          <div
            className="absolute left-0 right-0 top-6 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.72 0.18 265 / 0.5), oklch(0.65 0.22 300 / 0.5), transparent)",
            }}
          />
          <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {events.map((e, i) => (
              <motion.li
                key={e.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="relative"
              >
                <div
                  className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.18 0.05 265), oklch(0.1 0.03 265))",
                    boxShadow: "0 0 24px oklch(0.72 0.18 265 / 0.2)",
                  }}
                >
                  <e.icon className="h-5 w-5 text-nebula-cyan" />
                </div>
                <div className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {e.t}
                </div>
                <div className="mt-1 text-center text-sm text-white/85">
                  {e.label}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
