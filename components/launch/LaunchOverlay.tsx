"use client";

import { motion, AnimatePresence } from "motion/react";
import { Rocket } from "lucide-react";
import { Repository } from "@/hooks/use-repository";

interface LaunchOverlayProps {
  launching: Repository | null;
}

export function LaunchOverlay({ launching }: LaunchOverlayProps) {
  return (
    <AnimatePresence>
      {launching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex flex-col items-center"
          >
            <motion.div
              className="relative h-40 w-40"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-4 rounded-full border border-primary/40" />
              <div className="absolute inset-8 rounded-full border border-primary/20" />
              <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_30px_#4493F8]" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Igniting analysis engines
            </div>
            <div className="mt-2 font-display text-xl text-white">
              {launching.owner}/{launching.name}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
