"use client";

import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { HeroGalaxy } from "./HeroGalaxy";
import { MissionStatusPanel } from "./MissionStatusPanel";
import { AgentsPanel } from "./AgentsPanel";
import { Button } from "../ui/button";
import { FiGithub } from "react-icons/fi";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[280px_1fr_280px]">
        <div className="order-2 hidden lg:order-1 lg:block">
          <MissionStatusPanel />
        </div>

        <div className="order-1 flex flex-col items-center text-center lg:order-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-6xl leading-[0.98] tracking-tight sm:text-7xl lg:text-[5.5rem]"
          >
            The AI Software
            <br />
            <span className="text-gradient">Command Center.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 max-w-xl text-base text-white/60 sm:text-lg"
          >
            Nebula turns any GitHub repository into a living, interactive
            software universe. Explore architecture, talk to AI agents, and
            keep documentation alive — automatically.
          </motion.p>

          <div className="my-12">
            <HeroGalaxy />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button
              className="group inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-primary-foreground"
              style={{
                background:
                  "#4493F8",
                boxShadow: "0 10px 30px -10px oklch(0.72 0.18 265 / 0.8)",
              }}
            >
              <FiGithub className="h-4 w-4" />
              Connect GitHub
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/3 px-5 text-sm font-medium text-white/85 backdrop-blur transition-colors hover:bg-white/8">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </motion.div>
        </div>

        <div className="order-3 hidden lg:block">
          <AgentsPanel />
        </div>
      </div>


    </section>
  );
}
