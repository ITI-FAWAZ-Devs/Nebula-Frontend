import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Cpu, Send, AlertCircle, RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, AnswerMode, ResearchProgress } from "@/hooks/use-agent-chat";
import type { Repository } from "@/hooks/use-repository";
import { CitationBadges } from "./Panels";
import { chatMdComponents } from "./wiki-markdown";
import { DeepResearchProgress, ModeBadge } from "./DeepResearchProgress";
import { ModelPicker } from "./ModelPicker";
import { ConversationThreads } from "./ConversationThreads";

interface ArchitectureWikiChatProps {
  repoName: string;
  repositoryId: string | null;
  repository?: Repository | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  suggestedFollowups?: string[];
  answerMode?: AnswerMode;
  researchProgress?: ResearchProgress | null;
  chatInput: string;
  setChatInput: (value: string) => void;
  chatExpanded: boolean;
  setChatExpanded: (expanded: boolean) => void;
  onSendMessage: (options?: { mode?: "standard" | "deep"; model?: string }) => void;
  onClearConversation?: () => void;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ArchitectureWikiChat({
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
  chatExpanded,
  setChatExpanded,
  onSendMessage,
  onClearConversation,
  chatScrollRef,
}: ArchitectureWikiChatProps) {
  const router = useRouter();
  const [deepMode, setDeepMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const chatDisabled = !repositoryId || isStreaming;

  const handleOpenVoice = () => {
    if (!repositoryId) return;
    router.push(
      `/voice?repoId=${repositoryId}&repo=${encodeURIComponent(repoName ?? "")}`
    );
  };

  const handleSend = () => {
    onSendMessage({
      mode: deepMode ? "deep" : "standard",
      model: selectedModel,
    });
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl flex flex-col w-full">
        <AnimatePresence>
          {(chatExpanded || messages.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "38vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-white/5 flex flex-col"
            >
              {showSearch && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/40 shrink-0">
                  <Search className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in conversation messages..."
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[11px] text-white/40 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="p-1 text-white/40 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div
                ref={chatScrollRef}
                className="h-full w-full overflow-y-auto px-4 py-4 no-scrollbar flex flex-col gap-4"
              >
                {filteredMessages.map((m, idx) => {
                  const isLastAssistant =
                    m.role === "assistant" && idx === filteredMessages.length - 1;

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        m.role === "user" ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      {m.role === "assistant" && isLastAssistant && answerMode && (
                        <div className="mb-1">
                          <ModeBadge mode={answerMode} />
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm shadow-sm",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/5 text-foreground border border-white/10"
                        )}
                      >
                        {m.role === "assistant" && isLastAssistant && isStreaming && answerMode === "deep" && (
                          <DeepResearchProgress progress={researchProgress} />
                        )}

                        {m.role === "assistant" && !m.isStreaming ? (
                          <ReactMarkdown components={chatMdComponents}>
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                        )}

                        {m.isStreaming && m.content.length === 0 && !researchProgress && (
                          <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>

                      {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                        <CitationBadges citations={m.citations} repository={repository} />
                      )}

                      {m.failed && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Message failed to complete
                        </div>
                      )}
                    </div>
                  );
                })}

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

              {/* Follow-up suggestion chips */}
              {suggestedFollowups.length > 0 && !isStreaming && (
                <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-white/5 bg-black/20">
                  {suggestedFollowups.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setChatInput(q);
                        onSendMessage({ mode: deepMode ? "deep" : "standard", model: selectedModel });
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors text-left truncate max-w-full"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-3">
          <div
            className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-sm focus-within:border-white/20 transition-colors"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
          >
            {onClearConversation && (
              <ConversationThreads
                repositoryId={repositoryId}
                onNewConversation={onClearConversation}
              />
            )}

            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              title="Search conversation"
              className={cn(
                "shrink-0 flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                showSearch
                  ? "border-primary/50 bg-primary/20 text-primary"
                  : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"
              )}
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            <ModelPicker
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onFocus={() => setChatExpanded(true)}
              placeholder={
                deepMode
                  ? `Deep research mode enabled for ${repoName}…`
                  : `Ask anything about ${repoName}…`
              }
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/25 outline-none disabled:opacity-40"
              disabled={chatDisabled}
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
                "shrink-0 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-200",
                deepMode
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
              )}
            >
              <Cpu className={cn("h-3 w-3", deepMode && "animate-pulse text-purple-400")} />
              <span>Think</span>
            </button>

            {chatInput.trim() ? (
              <motion.button
                type="button"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={chatDisabled}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={handleOpenVoice}
                title="Open voice mode"
                disabled={!repositoryId}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 shadow-[0_0_12px_2px_rgba(68,147,248,0.4)] disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
                  <rect x="2" y="8" width="2" height="4" rx="1" />
                  <rect x="5.5" y="5" width="2" height="10" rx="1" />
                  <rect x="9" y="3" width="2" height="14" rx="1" />
                  <rect x="12.5" y="5" width="2" height="10" rx="1" />
                  <rect x="16" y="8" width="2" height="4" rx="1" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
