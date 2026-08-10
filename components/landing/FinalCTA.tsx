"use client";

import { motion } from "motion/react";
import { ArrowRight, Cpu, Play, Rocket } from "lucide-react";
import { FiGithub } from "react-icons/fi";

export function FinalCTA() {
  return (
    <section id="cta" className="relative py-40">
      <div className="mx-auto max-w-[90rem] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden premium-panel px-8 py-20 sm:px-16"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            // style={{
            //   background:
            //     "radial-gradient(ellipse at center, #4493F84d, transparent 60%)",
            // }}
          />
          <div className="relative">
            {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
              <Rocket className="h-3 w-3 text-primary" /> Ready for launch
            </div> */}
            <h2 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
              Your software deserves a{" "}
              <span className="text-gradient">living architecture.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
              Connect a repository and Nebula boots your software universe in
              under a minute.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className="group relative inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                style={{ background:"#4493F8"}}
              >
                <FiGithub className="h-4 w-4" />
                Connect GitHub
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/3 px-6 text-sm font-medium text-white/85 backdrop-blur transition-colors hover:bg-white/8">
                <Play className="h-4 w-4" />
                Watch Demo
              </button>
            </div>
          </div>
        </motion.div>

        <footer className="mt-16 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3" /> Nebula OS · v1.0
          </div>
          <div>© 2026 Nebula Systems</div>
        </footer>
      </div>
    </section>
  );
}
