"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Loader2,
  FileText,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceAgent } from "@/hooks/use-voice-agent";
import type { VoiceMessage, AgentCitation } from "@/lib/voice/types";
import type { Repository } from "@/hooks/use-repository";

interface VoiceAgentPanelProps {
  repositoryId: string;
  repository?: Repository | null;
}

// ─── Animated waveform ────────────────────────────────────────────────────────

// Deterministic bar heights per index — no Math.random() during render
const BAR_HEIGHTS: [number, number, number][] = [
  [8, 18, 9],
  [12, 22, 10],
  [10, 24, 12],
  [14, 20, 8],
  [9, 23, 11],
  [13, 19, 10],
  [8, 17, 9],
];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {BAR_HEIGHTS.map(([lo, hi, lo2], i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-current"
          animate={
            active
              ? { height: [`${lo}px`, `${hi}px`, `${lo2}px`] }
              : { height: "4px" }
          }
          transition={
            active
              ? { duration: 0.5 + i * 0.07, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

// ─── Citation badge ───────────────────────────────────────────────────────────

function CitationBadge({
  citation,
  repository,
}: {
  citation: AgentCitation;
  repository?: Repository | null;
}) {
  const href = buildGithubUrl(citation, repository);
  const label = citation.filePath.split("/").slice(-1)[0] ?? citation.filePath;
  const title = citation.lineRange
    ? `${citation.filePath}:${citation.lineRange}`
    : citation.filePath;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60 hover:border-primary/40 hover:text-white/90 transition-colors"
      >
        <FileText className="h-2.5 w-2.5 text-primary/50 shrink-0" />
        {label}
        {citation.lineRange && (
          <span className="text-white/30">:{citation.lineRange}</span>
        )}
      </a>
    );
  }

  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60"
    >
      <FileText className="h-2.5 w-2.5 text-primary/50 shrink-0" />
      {label}
    </span>
  );
}

function buildGithubUrl(
  citation: AgentCitation,
  repository?: Repository | null
): string | null {
  if (!repository) return null;
  const { owner, name, defaultBranch } = repository;
  if (!owner || !name) return null;
  const base = `https://github.com/${owner}/${name}/blob/${defaultBranch}/${citation.filePath}`;
  if (citation.lineRange) {
    const [start, end] = citation.lineRange.split("-");
    const hash = end ? `#L${start}-L${end}` : `#L${start}`;
    return `${base}${hash}`;
  }
  return base;
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  repository,
}: {
  message: VoiceMessage;
  repository?: Repository | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col gap-1.5",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-widest text-white/30">
        {message.role === "user" ? "You" : "Agent"}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          message.role === "user"
            ? "bg-primary/15 text-foreground"
            : "bg-white/5 text-foreground/90"
        )}
      >
        <span className="whitespace-pre-wrap">{message.text}</span>
      </div>
      {message.citations.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[85%]">
          {message.citations.map((c, i) => (
            <CitationBadge
              key={`${c.nodeId}-${i}`}
              citation={c}
              repository={repository}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function VoiceAgentPanel({
  repositoryId,
  repository,
}: VoiceAgentPanelProps) {
  const {
    uiState,
    messages,
    error,
    partialTranscript,
    streamingAnswer,
    start,
    stop,
    interrupt,
  } = useVoiceAgent(repositoryId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Auto-scroll conversation
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingAnswer, partialTranscript]);

  const handleToggle = async () => {
    if (active) {
      stop();
      setActive(false);
    } else {
      setActive(true);
      await start();
    }
  };

  const stateLabel: Record<typeof uiState, string> = {
    idle: "Ready to talk",
    listening: "Listening…",
    processing: "Thinking…",
    speaking: "Speaking…",
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* ── Control area ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* State label */}
        <motion.p
          key={uiState}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-xs font-medium tracking-widest uppercase",
            uiState === "idle" && "text-white/40",
            uiState === "listening" && "text-primary",
            uiState === "processing" && "text-amber-400",
            uiState === "speaking" && "text-emerald-400"
          )}
        >
          {stateLabel[uiState]}
        </motion.p>

        {/* Waveform or loader */}
        <div className="h-7 flex items-center justify-center">
          {uiState === "processing" ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-400/60" />
          ) : uiState === "listening" ? (
            <span className="text-primary">
              <Waveform active />
            </span>
          ) : uiState === "speaking" ? (
            <span className="text-emerald-400">
              <Waveform active />
            </span>
          ) : (
            <Volume2 className="h-4 w-4 text-white/20" />
          )}
        </div>

        {/* Mic / Stop buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleToggle}
            title={active ? "Stop session" : "Start voice session"}
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-200",
              active && uiState !== "idle"
                ? "border-primary bg-primary/15 text-primary shadow-[0_0_20px_0px_rgba(var(--primary-rgb),0.35)]"
                : "border-white/15 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/60"
            )}
          >
            {active ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
            {uiState === "listening" && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            )}
          </motion.button>

          {/* Interrupt button while speaking */}
          <AnimatePresence>
            {uiState === "speaking" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.93 }}
                onClick={interrupt}
                title="Stop speaking"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/50 hover:border-white/40 hover:text-white/80 transition-colors"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-destructive/80 text-center max-w-xs"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Conversation ─────────────────────────────────────────────── */}
      {(messages.length > 0 || partialTranscript || streamingAnswer) && (
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 px-1 pb-2 scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} repository={repository} />
          ))}

          {/* Partial transcript (in-progress user speech) */}
          {partialTranscript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-end gap-1"
            >
              <div className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                You
              </div>
              <div className="max-w-[85%] rounded-xl bg-primary/10 px-3.5 py-2.5 text-sm text-white/50 italic">
                {partialTranscript}
              </div>
            </motion.div>
          )}

          {/* Streaming agent answer */}
          {streamingAnswer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start gap-1"
            >
              <div className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                Agent
              </div>
              <div className="max-w-[85%] rounded-xl bg-white/5 px-3.5 py-2.5 text-sm text-foreground/70 leading-relaxed">
                {streamingAnswer}
                <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-foreground/50 animate-pulse rounded-sm" />
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
