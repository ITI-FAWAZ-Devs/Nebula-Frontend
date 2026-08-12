"use client";

import { cn } from "@/lib/utils";

export type VoiceOrbState = "idle" | "listening" | "processing" | "speaking";

interface VoiceOrbProps {
  state: VoiceOrbState;
  size?: number;
  className?: string;
}

const ORB_SIZE: Record<VoiceOrbState, number> = {
  idle:       120,
  listening:  160,
  processing: 150,
  speaking:   210,
};

/**
 * Animated voice orb — changes shape, size, and animation based on voice state.
 * Uses the CSS classes defined in globals.css (voice-orb-*).
 */
export function VoiceOrb({ state, size, className }: VoiceOrbProps) {
  const px = size ?? ORB_SIZE[state];

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Ripple rings — visible only while listening */}
      {state === "listening" && (
        <>
          <div className="voice-orb-ripple" style={{ width: px, height: px }} />
          <div className="voice-orb-ripple" style={{ width: px, height: px }} />
          <div className="voice-orb-ripple" style={{ width: px, height: px }} />
        </>
      )}

      {/* Core orb */}
      <div
        className={cn("voice-orb", `voice-orb-${state}`)}
        style={{ width: px, height: px }}
      />
    </div>
  );
}

/** Animated "Generating…" letter-by-letter text for the processing state */
export function GeneratingText({ className }: { className?: string }) {
  const letters = ["G", "e", "n", "e", "r", "a", "t", "i", "n", "g"];
  return (
    <span className={cn("loader-wrapper text-white/60", className)}>
      {letters.map((l, i) => (
        <span key={i} className="loader-letter">
          {l}
        </span>
      ))}
      <span className="ml-0.5 loader-letter" style={{ animationDelay: "0.8s" }}>
        …
      </span>
    </span>
  );
}
