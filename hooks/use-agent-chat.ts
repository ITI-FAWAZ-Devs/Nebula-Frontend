"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";
import { useAuthStore } from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AgentCitation {
  filePath: string;
  lineRange: string | null;
  nodeId: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: AgentCitation[];
  isStreaming?: boolean;
  failed?: boolean;
}

interface AgentSessionData {
  sessionId: string;
  repositoryId: string;
}

interface AgentDonePayload {
  answer: string;
  citations: AgentCitation[];
  citedNodeIds: string[];
  toolsUsed: string[];
  followups?: string[];
}

export type AnswerMode = "fast" | "standard" | "deep" | null;

export interface ResearchProgress {
  step: number;
  total: number;
  subQuestion: string;
}

interface StreamCallbacks {
  onCitation: (citation: AgentCitation) => void;
  onToken: (token: string) => void;
  onDone: (payload: AgentDonePayload) => void;
  onError: (message: string) => void;
  onFollowups: (followups: string[]) => void;
  onMode: (mode: "fast" | "standard" | "deep") => void;
  onProgress: (progress: ResearchProgress) => void;
}

const QUESTION_MAX_LENGTH = 4000;

function sessionKey(repositoryId: string) {
  return `nebula-agent-session:${repositoryId}`;
}

function messagesKey(repositoryId: string) {
  return `nebula-agent-messages:${repositoryId}`;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Storage helpers ────────────────────────────────────────────────────────

function loadSessionId(repositoryId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(sessionKey(repositoryId));
  } catch {
    return null;
  }
}

function saveSessionId(repositoryId: string, sessionId: string) {
  try {
    sessionStorage.setItem(sessionKey(repositoryId), sessionId);
  } catch {
    // ignore quota errors
  }
}

function clearSessionId(repositoryId: string) {
  try {
    sessionStorage.removeItem(sessionKey(repositoryId));
    sessionStorage.removeItem(messagesKey(repositoryId));
  } catch {
    // ignore
  }
}

function loadMessages(repositoryId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(messagesKey(repositoryId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.map((m) => ({ ...m, isStreaming: false }));
  } catch {
    return [];
  }
}

function saveMessages(repositoryId: string, messages: ChatMessage[]) {
  try {
    const toSave = messages.map(({ isStreaming: _, ...rest }) => rest);
    sessionStorage.setItem(messagesKey(repositoryId), JSON.stringify(toSave));
  } catch {
    // ignore quota errors
  }
}

// ─── Auth fetch helper ──────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await api.post("/api/auth/refresh");
    const { accessToken, user } = response.data.data;
    useAuthStore.getState().setAuth(user, accessToken);
    return accessToken;
  } catch {
    useAuthStore.getState().clearAuth();
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = useAuthStore.getState().accessToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function authFetch(
  url: string,
  init: RequestInit,
  retried = false
): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: { ...getAuthHeaders(), ...(init.headers as Record<string, string>) },
  });

  if (response.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return authFetch(url, init, true);
    }
  }

  return response;
}

// ─── SSE parser ─────────────────────────────────────────────────────────────

async function parseSSEStream(
  body: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";

  try {
    while (true) {
      if (signal?.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const raw = line.slice(5).trim();
          dispatchSSEEvent(currentEvent, raw, callbacks);
        } else if (line === "") {
          currentEvent = "message";
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function dispatchSSEEvent(
  event: string,
  raw: string,
  callbacks: StreamCallbacks
) {
  try {
    switch (event) {
      case "citation": {
        const citation = JSON.parse(raw) as AgentCitation;
        callbacks.onCitation(citation);
        break;
      }
      case "token": {
        const token = JSON.parse(raw) as string;
        callbacks.onToken(token);
        break;
      }
      case "followups": {
        const followups = JSON.parse(raw) as string[];
        callbacks.onFollowups(followups);
        break;
      }
      case "mode": {
        const mode = JSON.parse(raw) as "fast" | "standard" | "deep";
        callbacks.onMode(mode);
        break;
      }
      case "progress": {
        const progress = JSON.parse(raw) as ResearchProgress;
        callbacks.onProgress(progress);
        break;
      }
      case "done": {
        const payload = JSON.parse(raw) as AgentDonePayload;
        callbacks.onDone(payload);
        break;
      }
      case "error": {
        const err = JSON.parse(raw) as { message?: string };
        callbacks.onError(err.message ?? "An error occurred");
        break;
      }
    }
  } catch {
    // ignore malformed SSE payloads
  }
}

// ─── API functions ──────────────────────────────────────────────────────────

async function createAgentSession(repositoryId: string): Promise<AgentSessionData> {
  const response = await api.post(
    `/api/repositories/${repositoryId}/agent/sessions`
  );
  return response.data.data as AgentSessionData;
}

async function streamAgentMessage(
  repositoryId: string,
  sessionId: string,
  question: string,
  options: { mode?: "standard" | "deep"; model?: string },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/repositories/${repositoryId}/agent/sessions/${sessionId}/messages`;

  const response = await authFetch(url, {
    method: "POST",
    body: JSON.stringify({ question, mode: options.mode, model: options.model }),
    signal,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const json = await response.json();
      message = json.message ?? message;
    } catch {
      // use default message
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  await parseSSEStream(response.body, callbacks, signal);
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAgentChat(repositoryId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);
  const [answerMode, setAnswerMode] = useState<AnswerMode>(null);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress | null>(null);
  const [activeCitation, setActiveCitation] = useState<AgentCitation | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Restore persisted state on mount / repo change
  useEffect(() => {
    if (!repositoryId) return;
    sessionIdRef.current = loadSessionId(repositoryId);
    const stored = loadMessages(repositoryId);
    messagesRef.current = stored;
    setMessages(stored);
    setError(null);
    setSuggestedFollowups([]);
    setAnswerMode(null);
    setResearchProgress(null);
  }, [repositoryId]);

  // Persist messages whenever they change (excluding streaming flag churn)
  useEffect(() => {
    if (!repositoryId) return;
    saveMessages(repositoryId, messages);
    messagesRef.current = messages;
  }, [messages, repositoryId]);

  const clearError = useCallback(() => setError(null), []);

  const clearConversation = useCallback(() => {
    if (!repositoryId) return;
    sessionIdRef.current = null;
    clearSessionId(repositoryId);
    setMessages([]);
    messagesRef.current = [];
    setSuggestedFollowups([]);
    setAnswerMode(null);
    setResearchProgress(null);
    setError(null);
  }, [repositoryId]);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (!repositoryId) throw new Error("No repository selected");

    if (sessionIdRef.current) return sessionIdRef.current;

    const session = await createAgentSession(repositoryId);
    sessionIdRef.current = session.sessionId;
    saveSessionId(repositoryId, session.sessionId);
    return session.sessionId;
  }, [repositoryId]);

  const sendMessage = useCallback(
    async (
      question: string,
      options?: { mode?: "standard" | "deep"; model?: string }
    ) => {
      if (!repositoryId) {
        setError("No repository selected");
        return;
      }

      const trimmed = question.trim();
      if (!trimmed) return;
      if (trimmed.length > QUESTION_MAX_LENGTH) {
        setError(`Question must be ${QUESTION_MAX_LENGTH} characters or fewer`);
        return;
      }

      // Abort any in-flight stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        citations: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setError(null);
      setSuggestedFollowups([]);
      setAnswerMode(options?.mode ?? null);
      setResearchProgress(null);

      try {
        const sessionId = await ensureSession();

        await streamAgentMessage(
          repositoryId,
          sessionId,
          trimmed,
          options ?? {},
          {
            onCitation: (citation) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, citations: [...(m.citations ?? []), citation] }
                    : m
                )
              );
            },
            onToken: (token) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + token }
                    : m
                )
              );
            },
            onFollowups: (followups) => {
              setSuggestedFollowups(followups);
            },
            onMode: (mode) => {
              setAnswerMode(mode);
            },
            onProgress: (progress) => {
              setResearchProgress(progress);
            },
            onDone: (payload) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: payload.answer || m.content,
                        citations: payload.citations.length
                          ? payload.citations
                          : m.citations,
                        isStreaming: false,
                      }
                    : m
                )
              );
              if (payload.followups && payload.followups.length > 0) {
                setSuggestedFollowups(payload.followups);
              }
            },
            onError: (message) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        isStreaming: false,
                        failed: true,
                        content: m.content || message,
                      }
                    : m
                )
              );
              setError(message);
            },
          },
          controller.signal
        );

        // Mark streaming complete if not already done via onDone/onError
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.isStreaming
              ? { ...m, isStreaming: false }
              : m
          )
        );
      } catch (err) {
        if (controller.signal.aborted) return;

        const message =
          (err as Error)?.message ?? "Failed to send message";

        // Clear invalid session on 404
        if (message.toLowerCase().includes("not found")) {
          sessionIdRef.current = null;
          clearSessionId(repositoryId);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isStreaming: false,
                  failed: true,
                  content: m.content
                    ? `${m.content}\n\n(interrupted)`
                    : message,
                }
              : m
          )
        );
        setError(message);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [repositoryId, ensureSession]
  );

  return {
    messages,
    isStreaming,
    error,
    suggestedFollowups,
    answerMode,
    researchProgress,
    sendMessage,
    clearError,
    clearConversation,
  };
}
