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
    <section id="timeline" className="relative py-40">
      <div className="mx-auto max-w-[90rem] px-6">
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
              background: "#4493F820",
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
                    background: "oklch(0.14 0.03 265)",
                    boxShadow: "0 0 24px #4493F833",
                  }}
                >
                  <e.icon className="h-5 w-5 text-primary" />
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
