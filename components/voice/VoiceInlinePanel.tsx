"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Cpu,
  Square,
  FileText,
  Mic,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceAgent } from "@/hooks/use-voice-agent";
import { VoiceOrb, GeneratingText } from "@/components/ui/ai-loader";
import type { VoiceMessage, AgentCitation } from "@/lib/voice/types";
import type { Repository } from "@/hooks/use-repository";

interface VoiceInlinePanelProps {
  repositoryId: string;
  repository?: Repository | null;
  repoName?: string;
}

// ─── Waveform bars ────────────────────────────────────────────────────────────

const BAR_HEIGHTS: [number, number, number][] = [
  [2, 8, 3], [3, 12, 4], [4, 14, 5], [3, 10, 4], [2, 9, 3],
];

function MicWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-3.5">
      {BAR_HEIGHTS.map(([lo, hi, lo2], i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-current"
          animate={
            active
              ? { height: [`${lo}px`, `${hi}px`, `${lo2}px`] }
              : { height: "2px" }
          }
          transition={
            active
              ? { duration: 0.4 + i * 0.06, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.15 }
          }
        />
      ))}
    </div>
  );
}

// ─── Citation badge ───────────────────────────────────────────────────────────

function buildGithubUrl(c: AgentCitation, repo?: Repository | null) {
  if (!repo?.owner || !repo?.name) return null;
  const base = `https://github.com/${repo.owner}/${repo.name}/blob/${repo.defaultBranch}/${c.filePath}`;
  if (c.lineRange) {
    const [s, e] = c.lineRange.split("-");
    return `${base}${e ? `#L${s}-L${e}` : `#L${s}`}`;
  }
  return base;
}

function CitationBadge({ c, repo }: { c: AgentCitation; repo?: Repository | null }) {
  const href = buildGithubUrl(c, repo);
  const label = c.filePath.split("/").pop() ?? c.filePath;
  const cls =
    "inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/45 hover:text-white/75 transition-colors";
  const inner = (
    <>
      <FileText className="h-2 w-2 shrink-0 text-purple-400/50" />
      {label}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({
  msg,
  repo,
}: {
  msg: VoiceMessage;
  repo?: Repository | null;
}) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
    >
      <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
        {isUser ? "You" : "Mizan"}
      </span>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
          isUser ? "bg-white/8 text-white/85" : "text-white/75",
        )}
      >
        {msg.text}
      </div>
      {msg.citations.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[82%]">
          {msg.citations.map((c, i) => (
            <CitationBadge key={`${c.nodeId}-${i}`} c={c} repo={repo} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoiceInlinePanel({
  repositoryId,
  repository,
  repoName = "repository",
}: VoiceInlinePanelProps) {
  const {
    uiState,
    messages,
    error,
    partialTranscript,
    streamingAnswer,
    start,
    stop,
    interrupt,
    sendText,
  } = useVoiceAgent(repositoryId);

  const [textInput, setTextInput] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-start voice session on mount (clicking the Voice tab is a user gesture)
  useEffect(() => {
    let alive = true;
    setSessionActive(true);
    start().catch(() => {
      if (alive) setSessionActive(false);
    });
    return () => {
      alive = false;
      stop();
      setSessionActive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll conversation
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingAnswer, partialTranscript]);

  const handleSendText = () => {
    const text = textInput.trim();
    if (!text || !sessionActive) return;
    sendText(text);
    setTextInput("");
  };

  const hasConversation =
    messages.length > 0 || !!partialTranscript || !!streamingAnswer;

  const stateMeta = {
    idle:       { label: "Ready",      color: "text-white/25" },
    listening:  { label: "Listening…",  color: "text-purple-300" },
    processing: { label: "",            color: "text-purple-300" },
    speaking:   { label: "Speaking…",   color: "text-purple-200" },
  } as const;

  return (
    <div className="flex flex-col" style={{ height: "55vh" }}>

      {/* ── Orb + state ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 pt-4 pb-2 shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={uiState}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <VoiceOrb state={uiState} size={72} />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={uiState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-4 flex items-center"
          >
            {uiState === "processing" ? (
              <GeneratingText className="text-[9px]" />
            ) : (
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-widest",
                  stateMeta[uiState].color,
                )}
              >
                {stateMeta[uiState].label}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Interrupt — visible only while speaking */}
        <AnimatePresence>
          {uiState === "speaking" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              whileTap={{ scale: 0.9 }}
              onClick={interrupt}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] text-white/45 hover:text-white/75 transition-colors"
            >
              <Square className="h-2.5 w-2.5 fill-current" />
              Stop
            </motion.button>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-[9px] text-rose-400/80 text-center max-w-xs px-4">
            {error}
          </p>
        )}
      </div>

      {/* ── Conversation ────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-2"
      >
        {hasConversation ? (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} repo={repository} />
            ))}

            {partialTranscript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-end gap-1"
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
                  You
                </span>
                <div className="max-w-[82%] rounded-2xl bg-white/5 px-3.5 py-2 text-xs italic text-white/35">
                  {partialTranscript}
                </div>
              </motion.div>
            )}

            {streamingAnswer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-start gap-1"
              >
                <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">
                  Mizan
                </span>
                <div className="max-w-[82%] text-xs leading-relaxed text-white/60">
                  {streamingAnswer}
                  <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse rounded-sm bg-white/40" />
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/15 select-none">
              {sessionActive ? "Speak or type to begin…" : "Starting…"}
            </p>
          </div>
        )}
      </div>

      {/* ── ChatGPT-style bottom bar ─────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        <div
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
        >
          {/* + */}
          <button
            className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/35 hover:text-white/65 transition-colors"
            title="Attach"
          >
            <Plus className="h-3 w-3" />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder={
              uiState === "listening"
                ? "Or type a question…"
                : `Ask about ${repoName}…`
            }
            className="flex-1 min-w-0 bg-transparent text-xs text-white/80 placeholder:text-white/25 outline-none"
          />

          {/* Think badge */}
          <button className="shrink-0 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/30 hover:text-white/55 transition-colors">
            <Cpu className="h-2.5 w-2.5" />
            <span className="text-[9px] font-medium">Think</span>
          </button>

          {/* Mic wave (active while listening) */}
          <AnimatePresence>
            {uiState === "listening" && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="shrink-0 overflow-hidden text-purple-300"
              >
                <MicWave active />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send typed text OR show mic state */}
          {textInput.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendText}
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-violet-700 text-white shadow-[0_0_14px_3px_rgba(139,68,255,0.4)]"
            >
              <Send className="h-3 w-3" />
            </motion.button>
          ) : (
            /* Orb button — shows voice state, glows while active */
            <motion.div
              className={cn(
                "shrink-0 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300",
                uiState === "listening"
                  ? "bg-gradient-to-br from-purple-400 to-violet-700 shadow-[0_0_14px_3px_rgba(139,68,255,0.5)]"
                  : uiState === "speaking"
                  ? "bg-gradient-to-br from-violet-500 to-indigo-700 shadow-[0_0_12px_2px_rgba(99,68,255,0.4)]"
                  : uiState === "processing"
                  ? "bg-gradient-to-br from-purple-500/70 to-violet-700/70"
                  : "bg-white/10",
              )}
            >
              <Mic className="h-3.5 w-3.5 text-white/70" />
              {uiState === "listening" && (
                <span className="absolute h-7 w-7 rounded-full border-2 border-purple-400/40 animate-ping" />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
