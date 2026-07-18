"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { BootSequence } from "./BootSequence";
import { NebulaBackdrop } from "./NebulaBackdrop";
// import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { SectionUnderstand } from "./SectionUnderstand";
import { SectionAgents } from "./SectionAgents";
import { SectionLivingArch } from "./SectionLivingArch";
import { SectionAskArchitect } from "./SectionAskArchitect";
import { SectionTimeline } from "./SectionTimeline";
import { SectionFeatures } from "./SectionFeatures";
import { FinalCTA } from "./FinalCTA";

export function NebulaLanding() {
  const [booting, setBooting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const beamY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    // Check if the user has already visited the site
    const hasBooted = localStorage.getItem("nebula_booted");
    if (!hasBooted) {
      setBooting(true);
    }
  }, []);

  const handleBootDone = useCallback(() => {
    localStorage.setItem("nebula_booted", "true");
    setBooting(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {booting && <BootSequence key="boot" onDone={handleBootDone} />}
      </AnimatePresence>

      <NebulaBackdrop />

      <div ref={containerRef} className="relative">
        {/* Side scroll beam */}
        {/* <motion.div
          className="pointer-events-none fixed left-6 top-0 z-30 hidden h-24 w-px lg:block"
          style={{
            top: beamY,
            background:
              "linear-gradient(to bottom, transparent, oklch(0.72 0.18 265), transparent)",
          }}
        /> */}

        {/* <Nav /> */}
        <Hero />
        <SectionUnderstand />
        <SectionAgents />
        <SectionLivingArch />
        <SectionAskArchitect />
        <SectionTimeline />
        <SectionFeatures />
        <FinalCTA />
      </div>
    </>
  );
}
