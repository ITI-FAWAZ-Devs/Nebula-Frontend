"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { cn } from "@/lib/utils";

export interface ThreadItem {
  id: string;
  repositoryId: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ConversationThreadsProps {
  repositoryId: string | null;
  onSelectThread?: (threadId: string) => void;
  onNewConversation: () => void;
}

export function ConversationThreads({
  repositoryId,
  onNewConversation,
}: ConversationThreadsProps) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchThreads = async () => {
    if (!repositoryId) return;
    setLoading(true);
    try {
      const response = await api.get(
        `/api/repositories/${repositoryId}/agent/threads`
      );
      setThreads(response.data.data || []);
    } catch {
      // ignore load errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && repositoryId) {
      fetchThreads();
    }
  }, [isOpen, repositoryId]);

  const handleDelete = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!repositoryId) return;
    try {
      await api.delete(
        `/api/repositories/${repositoryId}/agent/threads/${threadId}`
      );
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="History & Threads"
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-md p-2 shadow-2xl z-50 flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-white/5">
              <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Past Conversations
              </span>
              <button
                type="button"
                onClick={() => {
                  onNewConversation();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 rounded-lg bg-primary/20 border border-primary/40 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/30 transition-colors"
              >
                <Plus className="h-3 w-3" />
                New Chat
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-white/40 text-xs gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading threads...
                </div>
              ) : threads.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/40">
                  No past conversations saved yet.
                </div>
              ) : (
                threads.map((t) => (
                  <div
                    key={t.id}
                    className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-white/90 font-medium truncate">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {new Date(t.updatedAt).toLocaleDateString()} · {t.messageCount} msgs
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-rose-400 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
