"use client";

import { motion } from "motion/react";
import { Bot, Brain, Network, Radar, Search, ShieldCheck, Sparkles } from "lucide-react";
import { SectionEyebrow } from "./SectionEyebrow";

export function SectionAskArchitect() {
  const steps = [
    { label: "Question", icon: Search },
    { label: "Retriever", icon: Radar },
    { label: "Authentication Module", icon: ShieldCheck },
    { label: "Dependency Graph", icon: Network },
    { label: "LLM", icon: Brain },
    { label: "Answer", icon: Sparkles },
  ];

  return (
    <section id="product" className="relative py-40">
      <div className="mx-auto max-w-[90rem] px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Ask Your Architect</SectionEyebrow>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Watch your architect{" "}
            <span className="text-gradient">think.</span>
          </h2>
          <p className="mt-6 text-lg text-white/60">
            Not a chat window. A visible reasoning trace across your codebase.
          </p>
        </div>

        <div className="mt-16 premium-panel p-8 sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            {/* <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/3 text-xs text-white/60">
              You
            </div> */}
            <div className="font-display text-xl text-white/90 sm:text-2xl">
              &ldquo;Where is JWT implemented?&rdquo;
            </div>
          </div>

          <div className="relative">
            {/* Vertical glowing path */}
            <div
              className="absolute left-5 top-0 h-full w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, #4493F880, transparent)",
              }}
            />
            <ul className="space-y-3">
              {steps.map((s, i) => (
                <motion.li
                  key={s.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative flex items-center gap-4 pl-1"
                >
                  <div
                    className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
                    style={{
                      background:
                        "oklch(0.12 0.03 265)",
                      boxShadow:
                        "0 0 20px #4493F833",
                    }}
                  >
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 border-b border-dashed border-white/6 py-3">
                    <div className="font-display text-base text-white/90">
                      {s.label}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 rounded-lg border border-primary/20 bg-primary/4 p-5"
          >
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Bot className="h-3 w-3" /> Nebula
            </div>
            <p className="text-white/85">
              JWT is issued in{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-primary">
                auth/jwt.ts
              </code>{" "}
              via <code className="font-mono text-primary">signAccessToken()</code>,
              consumed by <code className="font-mono text-primary">middleware/verify.ts</code>{" "}
              and re-exported from the <code className="font-mono text-primary">auth</code>{" "}
              module used by <code className="font-mono text-primary">users</code> and{" "}
              <code className="font-mono text-primary">payments</code>.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
