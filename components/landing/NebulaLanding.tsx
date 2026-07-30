"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { BootSequence } from "./BootSequence";
import { NebulaBackdrop } from "./NebulaBackdrop";
import { Nav } from "./Nav";
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
      <Nav />

      <div ref={containerRef} className="relative">
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
