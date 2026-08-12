"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVoiceAgent } from "@/hooks/use-voice-agent";
import type { Repository } from "@/hooks/use-repository";

interface VoiceAgentPageProps {
  repositoryId: string;
  repository?: Repository | null;
  repoName?: string;
}

// ─── Orb sizes per state ──────────────────────────────────────────────────────

const ORB_SIZE: Record<string, number> = {
  idle:       160,
  listening:  190,
  processing: 175,
  speaking:   220,
};

// ─── Mic waveform (shown when listening) ─────────────────────────────────────

const BARS: [number, number, number][] = [
  [4, 14, 5], [6, 22, 8], [8, 28, 10], [10, 34, 12],
  [12, 38, 14], [10, 34, 12], [8, 28, 10], [6, 22, 8], [4, 14, 5],
];

function MicWave() {
  return (
    <div className="flex items-center gap-[3px] h-10">
      {BARS.map(([lo, hi, lo2], i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-white/70"
          animate={{ height: [`${lo}px`, `${hi}px`, `${lo2}px`] }}
          transition={{
            duration: 0.5 + i * 0.04,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoiceAgentPage({
  repositoryId,
  repoName = "repository",
}: VoiceAgentPageProps) {
  const router = useRouter();
  const {
    uiState,
    partialTranscript,
    streamingAnswer,
    messages,
    error,
    start,
    stop,
    interrupt,
    sendText,
  } = useVoiceAgent(repositoryId);

  const [textInput, setTextInput] = useState("");
  const [displayText, setDisplayText] = useState<string>("");
  const [displayRole, setDisplayRole] = useState<"user" | "agent">("agent");
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-start voice on mount
  useEffect(() => {
    start().catch(() => {});
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show latest text near the orb, then fade after the agent finishes
  useEffect(() => {
    if (partialTranscript) {
      setDisplayText(partialTranscript);
      setDisplayRole("user");
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    }
  }, [partialTranscript]);

  useEffect(() => {
    if (streamingAnswer) {
      setDisplayText(streamingAnswer);
      setDisplayRole("agent");
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    }
  }, [streamingAnswer]);

  useEffect(() => {
    // After the last message is complete, fade it after 4 s
    if (messages.length > 0 && !partialTranscript && !streamingAnswer) {
      const last = messages[messages.length - 1];
      setDisplayText(last.text);
      setDisplayRole(last.role === "user" ? "user" : "agent");
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => setDisplayText(""), 4000);
    }
  }, [messages, partialTranscript, streamingAnswer]);

  const handleClose = () => {
    stop();
    router.back();
  };

  const handleSend = () => {
    const t = textInput.trim();
    if (!t) return;
    sendText(t);
    setTextInput("");
  };

  // ─── Orb rendering with Framer Motion wrapper for glow ──────────────────────

  const isSpeaking  = uiState === "speaking";
  const isListening = uiState === "listening";
  const isProcessing = uiState === "processing";
  const orbSize = ORB_SIZE[uiState] ?? 160;

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden bg-black select-none">

      {/* ── Ambient background glow ─────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          opacity: isSpeaking ? 1 : isListening ? 0.6 : 0.3,
        }}
        transition={{ duration: 0.8 }}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 58%, rgba(110,50,220,0.22) 0%, transparent 70%)",
        }}
      />

      {/* ── Top-right close button ──────────────────────────────────────────── */}
      <div className="absolute top-5 right-5 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/50 hover:bg-white/15 hover:text-white/80 transition-colors backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {/* ── Central orb ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        {/* Orb with glow */}
        <div className="relative flex items-center justify-center">

          {/* Speaking outer glow layer */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                key="glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="voice-orb-speaking-glow"
                style={{ width: orbSize, height: orbSize }}
              />
            )}
          </AnimatePresence>

          {/* Listening ripple rings */}
          {isListening && (
            <>
              {[0, 0.6, 1.2].map((delay, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-purple-400/25"
                  style={{
                    width: orbSize + 40 + i * 20,
                    height: orbSize + 40 + i * 20,
                    animation: `ripple-out 2s ease-out ${delay}s infinite`,
                  }}
                />
              ))}
            </>
          )}

          {/* The orb itself */}
          <AnimatePresence mode="wait">
            <motion.div
              key={uiState}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{ scale: 0.8,    opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn("voice-orb rounded-full", `voice-orb-${uiState}`)}
              style={{ width: orbSize, height: orbSize }}
            />
          </AnimatePresence>
        </div>

        {/* Mic wave visualizer (listening state) */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <MicWave />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing dots */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              {[0, 150, 300].map((delay, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-purple-300/60 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript / response text — fades in below the orb */}
        <AnimatePresence mode="wait">
          {displayText && (
            <motion.p
              key={displayText.slice(0, 20)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{ opacity: 0,     y: -6 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "max-w-sm text-center text-sm leading-relaxed px-6",
                displayRole === "user"
                  ? "text-white/60 italic"
                  : "text-white/85",
              )}
            >
              {displayText}
              {(streamingAnswer || partialTranscript) && (
                <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse rounded-sm bg-white/50 align-middle" />
              )}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-xs text-rose-400/80 text-center px-6">{error}</p>
        )}

        {/* Interrupt (while speaking) */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1,  scale: 1 }}
              exit={{ opacity: 0,     scale: 0.85 }}
              whileTap={{ scale: 0.9 }}
              onClick={interrupt}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-sm bg-white/60" />
              Stop speaking
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-5 pb-8">
        <div
          className="flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-3 backdrop-blur-xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset" }}
        >
          {/* + */}
          <button className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/40 hover:text-white/70 transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>

          {/* Text input */}
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type"
            className="flex-1 min-w-0 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none"
          />

          {/* Mic indicator */}
          <div
            className={cn(
              "shrink-0 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300",
              isListening
                ? "text-purple-300"
                : "text-white/30",
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <rect x="2"   y="8"  width="2" height="4" rx="1" />
              <rect x="5.5" y="5"  width="2" height="10" rx="1" />
              <rect x="9"   y="3"  width="2" height="14" rx="1" />
              <rect x="12.5" y="5" width="2" height="10" rx="1" />
              <rect x="16"  y="8"  width="2" height="4" rx="1" />
            </svg>
          </div>

          {/* Send (when typing) OR close */}
          {textInput.trim() ? (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
            >
              <Send className="h-3.5 w-3.5" />
            </motion.button>
          ) : (
            <button
              onClick={handleClose}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/50 hover:bg-white/15 hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
