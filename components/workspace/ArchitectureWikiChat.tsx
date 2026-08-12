"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-agent-chat";
import { CitationBadges } from "./Panels";
import { chatMdComponents } from "./wiki-markdown";

interface ArchitectureWikiChatProps {
  repoName: string;
  repositoryId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  chatInput: string;
  setChatInput: (value: string) => void;
  chatExpanded: boolean;
  setChatExpanded: (expanded: boolean) => void;
  onSendMessage: () => void;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ArchitectureWikiChat({
  repoName,
  repositoryId,
  messages,
  isStreaming,
  chatInput,
  setChatInput,
  chatExpanded,
  setChatExpanded,
  onSendMessage,
  chatScrollRef,
}: ArchitectureWikiChatProps) {
  const chatDisabled = !repositoryId || isStreaming;

  return (
    <div className="shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="mx-auto max-w-3xl flex flex-col w-full">
        <AnimatePresence>
          {(chatExpanded || messages.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "40vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-white/5"
            >
              <div
                ref={chatScrollRef}
                className="h-full w-full overflow-y-auto px-4 py-4 no-scrollbar flex flex-col gap-4"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      m.role === "user" ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm shadow-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/5 text-foreground border border-white/10"
                      )}
                    >
                      {m.role === "assistant" && !m.isStreaming ? (
                        <ReactMarkdown components={chatMdComponents}>
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      )}
                      {m.isStreaming && m.content.length === 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                    {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                      <CitationBadges citations={m.citations} />
                    )}
                    {m.failed && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        Message failed to complete
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex flex-col max-w-[85%] self-start items-start">
                    <div className="rounded-2xl px-4 py-3 text-sm shadow-sm bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 focus-within:border-primary/40 focus-within:bg-white/5 transition-all">
            <Sparkles className="h-4 w-4 shrink-0 text-primary/60" />
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onFocus={() => setChatExpanded(true)}
              placeholder={`Ask Nebula about ${repoName}…`}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground/50 outline-none disabled:opacity-50"
              disabled={chatDisabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                Fast
              </span>
              <button
                onClick={onSendMessage}
                disabled={!chatInput.trim() || chatDisabled}
                className="rounded-lg bg-primary/20 p-1.5 text-primary transition-colors hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
