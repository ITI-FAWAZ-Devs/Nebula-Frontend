import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Cpu, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelPicker } from "./ModelPicker";
import { ConversationThreads } from "./ConversationThreads";

interface ArchitectureWikiChatProps {
  repoName: string;
  repositoryId: string | null;
  isStreaming: boolean;
  chatInput: string;
  setChatInput: (value: string) => void;
  onSendMessage: (options?: { mode?: "standard" | "deep"; model?: string }) => void;
  onClearConversation?: () => void;
  onSelectThread?: (threadId: string) => void;
}

export function ArchitectureWikiChat({
  repoName,
  repositoryId,
  isStreaming,
  chatInput,
  setChatInput,
  onSendMessage,
  onClearConversation,
  onSelectThread,
}: ArchitectureWikiChatProps) {
  const router = useRouter();
  const [deepMode, setDeepMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
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

  return (
    <div className="shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl flex flex-col w-full">
        <div className="px-4 py-3">
          <div
            className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-sm focus-within:border-white/20 transition-colors"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
          >
            <ConversationThreads
              repositoryId={repositoryId}
              onSelectThread={onSelectThread}
              onNewConversation={onClearConversation ?? (() => {})}
            />

            <ModelPicker
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
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
