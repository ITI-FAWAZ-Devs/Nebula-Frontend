"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";

interface CompleteOverlayProps {
  complete: boolean;
}

export function CompleteOverlay({ complete }: CompleteOverlayProps) {
  return (
    <AnimatePresence>
      {complete && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-55 flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative h-32 w-32">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-white/10" 
              />
              <div className="absolute inset-4 rounded-full bg-primary shadow-[0_0_60px_#4493F8]" />
            </div>
            <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Galaxy online</div>
            <div className="mt-2 font-display text-3xl text-white">Entering workspace…</div>
            <ArrowRight className="mt-4 h-5 w-5 animate-pulse text-muted-foreground" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
