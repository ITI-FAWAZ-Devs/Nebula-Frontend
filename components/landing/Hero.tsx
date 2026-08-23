"use client";

import { motion } from "motion/react";
import {
  Lock,
  MousePointerClick,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { FiGithub } from "react-icons/fi";
import { Button } from "../ui/button";
import { HeroProductPreview } from "./HeroProductPreview";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Grounded in your code",
    subtitle: "Answers backed by real files",
    color: "#A78BFA",
  },
  {
    icon: MousePointerClick,
    title: "Clickable citations",
    subtitle: "Trace every answer",
    color: "#34D399",
  },
  {
    icon: RefreshCw,
    title: "Always up to date",
    subtitle: "Syncs with your repo",
    color: "#60A5FA",
  },
  {
    icon: Lock,
    title: "Your code stays private",
    subtitle: "Secure & enterprise ready",
    color: "#C084FC",
  },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 pt-28 pb-16 lg:pt-24 lg:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at 30% 40%, black 10%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[90rem] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
        <div className="flex flex-col items-start text-left">
          {/* <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-white/70 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#F48C50]" />
            <span>Turn any GitHub repo into a code knowledge graph.</span>
          </motion.div> */}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.75rem]"
          >
            Ask your repo.
            <br />
            Get architecture
            <br />
            <span className="text-[#3E85E0]">
              you can trust.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            Nebula indexes your code into a knowledge graph and living
            documentation. Ask questions. Get answers grounded in real code with
            clickable citations. Generate architecture docs that stay up to
            date.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <Link href="/login">
              <Button
                className="group relative inline-flex h-12 items-center gap-2.5 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
              >
                <FiGithub className="h-4 w-4" />
                Connect GitHub
              </Button>
            </Link>
            <Link href="/#product">
              <Button
                variant="outline"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl border-white/15 bg-transparent px-6 text-sm font-medium text-white/85 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] hover:text-white hover:-translate-y-0.5"
              >
                {/* <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/25"> */}
                <Play className="h-2.5 w-2.5 fill-current" />
                {/* </span> */}
                See how it works
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-12 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.08, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    color: item.color,
                    borderColor: `${item.color}33`,
                    background: `${item.color}14`,
                  }}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white leading-snug">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-xs text-white/45 leading-snug">
                    {item.subtitle}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px]"
        >
          <HeroProductPreview />
        </motion.div>
      </div>
    </section>
  );
}
