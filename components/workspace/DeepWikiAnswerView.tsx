"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Cpu,
  Send,
  Loader2,
  Copy,
  Check,
  Search,
  Sparkles,
  RefreshCw,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { ChatMessage, AnswerMode, ResearchProgress, AgentCitation } from "@/hooks/use-agent-chat";
import type { Repository } from "@/hooks/use-repository";
import { InlineCitationPill, InlineCitationBadge } from "./InlineCitations";
import { ModeBadge, DeepResearchProgress } from "./DeepResearchProgress";
import { CitedSourceViewer } from "./CitedSourceViewer";
import { chatMdComponents } from "./wiki-markdown";
import { ModelPicker } from "./ModelPicker";

interface DeepWikiAnswerViewProps {
  repoName: string;
  repositoryId: string | null;
  repository?: Repository | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  suggestedFollowups?: string[];
  answerMode?: AnswerMode;
  researchProgress?: ResearchProgress | null;
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendMessage: (options?: { mode?: "standard" | "deep"; model?: string }) => void;
  onClearConversation?: () => void;
  onBackToDocs?: () => void;
}

export function DeepWikiAnswerView({
  repoName,
  repositoryId,
  repository,
  messages,
  isStreaming,
  suggestedFollowups = [],
  answerMode = null,
  researchProgress = null,
  chatInput,
  setChatInput,
  onSendMessage,
  onClearConversation,
  onBackToDocs,
}: DeepWikiAnswerViewProps) {
  const [deepMode, setDeepMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
  const [activeCitation, setActiveCitation] = useState<AgentCitation | null>(null);
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);

  const leftPaneScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll left pane to bottom on new message / streaming
  useEffect(() => {
    leftPaneScrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Extract all citations from current conversation turns
  const currentAssistantMsg = messages.filter((m) => m.role === "assistant").slice(-1)[0];
  const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0];

  const allCitations = React.useMemo(() => {
    const citations: AgentCitation[] = [];
    for (const m of messages) {
      if (m.role === "assistant" && m.citations) {
        citations.push(...m.citations);
      }
    }
    return citations;
  }, [messages]);

  const handleCopyAnswer = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedAnswerId(msgId);
      setTimeout(() => setCopiedAnswerId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleSend = () => {
    onSendMessage({
      mode: deepMode ? "deep" : "standard",
      model: selectedModel,
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* ── LEFT PANE (~40% width) ── */}
      <div className="flex w-full md:w-[42%] flex-col border-r border-white/5 bg-slate-950/80 relative">
        {/* Header Breadcrumb */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-3 bg-black/40">
          <button
            type="button"
            onClick={onBackToDocs}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-mono text-[11px]">← {repoName}</span>
          </button>

          {onClearConversation && (
            <button
              type="button"
              onClick={onClearConversation}
              className="flex items-center gap-1 text-[11px] font-mono text-white/40 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>New Thread</span>
            </button>
          )}
        </div>

        {/* Scrollable Conversation Content */}
        <div
          ref={leftPaneScrollRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32 no-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary mb-3 border border-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white">
                DeepWiki Q&A Agent
              </h3>
              <p className="text-xs text-white/40 mt-1 max-w-sm leading-relaxed">
                Ask any question about architecture, implementation, or dependencies in {repoName}.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="space-y-2 pt-2 first:pt-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                      Question
                    </div>
                    {/* DeepWiki Question Page-Title Heading */}
                    <h1 className="text-xl md:text-2xl font-display font-semibold text-white leading-tight">
                      {m.content}
                    </h1>
                  </div>
                );
              }

              // Assistant Answer Card
              const isLastAssistant = idx === messages.length - 1;
              const hasCitations = m.citations && m.citations.length > 0;

              return (
                <div key={m.id} className="space-y-3">
                  {/* Mode Badge */}
                  {answerMode && (
                    <div className="flex items-center gap-2">
                      <ModeBadge mode={answerMode} />
                    </div>
                  )}

                  {/* DeepWiki Answer Card */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg relative space-y-4">
                    {/* Header bar inside Answer Card */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="font-display text-xs font-semibold text-white/80 tracking-wide uppercase">
                        Answer
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(m.id, m.content)}
                        className="flex items-center gap-1 text-[11px] font-mono text-white/40 hover:text-white transition-colors"
                      >
                        {copiedAnswerId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedAnswerId === m.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Two-Stage Loading State: Searching Codebase */}
                    {m.isStreaming && m.content.length === 0 && !researchProgress && (
                      <div className="flex items-center gap-2.5 text-xs text-sky-400 py-3 font-mono">
                        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                        <span>Searching the codebase…</span>
                      </div>
                    )}

                    {/* Deep Research Progress */}
                    {m.isStreaming && answerMode === "deep" && (
                      <DeepResearchProgress progress={researchProgress} />
                    )}

                    {/* Rendered Markdown Body */}
                    {m.content.length > 0 && (
                      <div className="text-sm text-foreground/90 leading-relaxed font-sans prose prose-invert max-w-none">
                        <ReactMarkdown components={chatMdComponents}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Inline / Bottom Citations Pills */}
                    {hasCitations && (
                      <div className="border-t border-white/5 pt-3 mt-4">
                        <div className="text-[11px] font-mono text-white/40 mb-2">
                          Sources Cited:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.citations!.map((c, cIdx) => (
                            <InlineCitationPill
                              key={cIdx}
                              citation={c}
                              index={cIdx}
                              repository={repository}
                              onSelectCitation={setActiveCitation}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating / Sticky Follow-Up Composer (Footer) */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 backdrop-blur-md p-4 space-y-3 z-30">
          {/* Suggested Follow-Up Prompt Chips */}
          {suggestedFollowups.length > 0 && !isStreaming && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {suggestedFollowups.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setChatInput(q);
                    onSendMessage({ mode: deepMode ? "deep" : "standard", model: selectedModel });
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:text-white hover:border-sky-400 hover:bg-sky-500/10 transition-all text-left truncate max-w-full cursor-pointer"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Control Row */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-3.5 py-2 shadow-inner focus-within:border-primary/50 transition-colors">
            <ModelPicker selectedModel={selectedModel} onSelectModel={setSelectedModel} />

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a follow-up question…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-40"
              disabled={!repositoryId || isStreaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              type="button"
              onClick={() => setDeepMode(!deepMode)}
              title={deepMode ? "Deep Research Mode ON" : "Toggle Deep Research Mode"}
              className={cn(
                "shrink-0 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-200 cursor-pointer",
                deepMode
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
              )}
            >
              <Cpu className={cn("h-3 w-3", deepMode && "animate-pulse text-purple-400")} />
              <span>Think</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!repositoryId || isStreaming || !chatInput.trim()}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANE (~58% width) Cited Source Code Viewer ── */}
      <div className="hidden md:block flex-1 h-full overflow-hidden">
        <CitedSourceViewer
          citations={allCitations}
          repoName={repoName}
          repository={repository}
          activeCitation={activeCitation}
          onSelectCitation={setActiveCitation}
        />
      </div>
    </div>
  );
}
