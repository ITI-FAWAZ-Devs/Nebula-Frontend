"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";
import { useAuthStore } from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AgentCitation {
  filePath: string;
  lineRange: string | null;
  nodeId: string;
  /** Source snippet for the right-pane code viewer */
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: AgentCitation[];
  isStreaming?: boolean;
  failed?: boolean;
}

export interface ScanEvent {
  filePath: string;
  tool: string;
}

export interface WebSource {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

interface AgentSessionData {
  sessionId: string;
  repositoryId: string;
  threadId?: string | null;
}

/** Identifies the conversation everything must append to. */
interface ChatPointer {
  sessionId: string | null;
  threadId: string | null;
}

interface AgentSessionPayload {
  sessionId: string;
  threadId: string;
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
  onScanning: (event: ScanEvent) => void;
  onWebSource: (source: WebSource) => void;
  onSession: (payload: AgentSessionPayload) => void;
}

const QUESTION_MAX_LENGTH = 4000;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Storage helpers ────────────────────────────────────────────────────────

function sessionKey(repositoryId: string) {
  return `nebula-agent-session:${repositoryId}`;
}

function messagesKey(repositoryId: string) {
  return `nebula-agent-messages:${repositoryId}`;
}

function loadChatPointer(repositoryId: string): ChatPointer {
  if (typeof window === "undefined") return { sessionId: null, threadId: null };
  try {
    const raw = localStorage.getItem(sessionKey(repositoryId));
    if (!raw) return { sessionId: null, threadId: null };
    const parsed = JSON.parse(raw) as Partial<ChatPointer>;
    return {
      sessionId:
        typeof parsed.sessionId === "string" ? parsed.sessionId : null,
      threadId: typeof parsed.threadId === "string" ? parsed.threadId : null,
    };
  } catch {
    // Unparseable/legacy value — start fresh rather than forking silently.
    return { sessionId: null, threadId: null };
  }
}

function saveChatPointer(repositoryId: string, pointer: ChatPointer) {
  try {
    localStorage.setItem(sessionKey(repositoryId), JSON.stringify(pointer));
  } catch {
    // ignore quota errors
  }
}

/** Drop the session/thread binding and the cached transcript. */
function clearConversationCache(repositoryId: string) {
  try {
    localStorage.removeItem(sessionKey(repositoryId));
    localStorage.removeItem(messagesKey(repositoryId));
  } catch {
    // ignore
  }
}

function loadMessages(repositoryId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(messagesKey(repositoryId));
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
    localStorage.setItem(messagesKey(repositoryId), JSON.stringify(toSave));
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
      case "scanning": {
        const scan = JSON.parse(raw) as ScanEvent;
        callbacks.onScanning(scan);
        break;
      }
      case "web_source": {
        const source = JSON.parse(raw) as WebSource;
        callbacks.onWebSource(source);
        break;
      }
      case "session": {
        const payload = JSON.parse(raw) as AgentSessionPayload;
        callbacks.onSession(payload);
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
  options: {
    mode?: "standard" | "deep";
    model?: string;
    threadId?: string | null;
  },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/repositories/${repositoryId}/agent/sessions/${sessionId}/messages`;

  const response = await authFetch(url, {
    method: "POST",
    body: JSON.stringify({
      question,
      mode: options.mode,
      model: options.model,
      threadId: options.threadId ?? undefined,
    }),
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
  const [scanLog, setScanLog] = useState<ScanEvent[]>([]);
  const [webSources, setWebSources] = useState<WebSource[]>([]);

  const sessionIdRef = useRef<string | null>(null);
  const threadIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Restore persisted state on mount / repo change
  useEffect(() => {
    if (!repositoryId) return;
    const pointer = loadChatPointer(repositoryId);
    sessionIdRef.current = pointer.sessionId;
    threadIdRef.current = pointer.threadId;
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
    threadIdRef.current = null;
    clearConversationCache(repositoryId);
    setMessages([]);
    messagesRef.current = [];
    setSuggestedFollowups([]);
    setAnswerMode(null);
    setResearchProgress(null);
    setError(null);
    setScanLog([]);
    setWebSources([]);
  }, [repositoryId]);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (!repositoryId) throw new Error("No repository selected");

    if (sessionIdRef.current) return sessionIdRef.current;

    const session = await createAgentSession(repositoryId);
    sessionIdRef.current = session.sessionId;
    // Keep any existing thread binding so messages continue the same
    // conversation even after the old session expired.
    saveChatPointer(repositoryId, {
      sessionId: session.sessionId,
      threadId: threadIdRef.current,
    });
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
      setScanLog([]);
      setWebSources([]);

      try {
        const sessionId = await ensureSession();

        await streamAgentMessage(
          repositoryId,
          sessionId,
          trimmed,
          {
            mode: options?.mode,
            model: options?.model,
            // Reuse the active conversation thread on every message.
            threadId: threadIdRef.current,
          },
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
            onScanning: (event) => {
              setScanLog((prev) => [...prev, event]);
            },
            onWebSource: (source) => {
              setWebSources((prev) => [...prev, source]);
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
            onSession: (payload) => {
              // Server confirmed which thread this conversation belongs to.
              threadIdRef.current = payload.threadId;
              if (repositoryId) {
                saveChatPointer(repositoryId, {
                  sessionId: sessionIdRef.current,
                  threadId: payload.threadId,
                });
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

        // Recover from an expired/invalid session on 404: drop the session
        // binding but KEEP the thread id so the retry (new session) still
        // appends to the same conversation history.
        if (message.toLowerCase().includes("not found")) {
          sessionIdRef.current = null;
          saveChatPointer(repositoryId, {
            sessionId: null,
            threadId: threadIdRef.current,
          });
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

  const loadThread = useCallback(
    async (threadId: string) => {
      if (!repositoryId) return;
      abortRef.current?.abort();
      try {
        const response = await api.get(
          `/api/repositories/${repositoryId}/agent/threads/${threadId}`
        );
        const data = response.data.data as {
          messages: Array<{
            id: string;
            role: string;
            content: string;
            citations?: AgentCitation[] | null;
          }>;
        };
        const loaded: ChatMessage[] = (data.messages ?? []).map((m) => ({
          id: m.id,
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
          citations: Array.isArray(m.citations) ? m.citations : undefined,
          isStreaming: false,
        }));
        if (threadIdRef.current !== threadId) {
          // Rebind to the loaded conversation. The next message lazily
          // creates a fresh session that carries this threadId, so follow-ups
          // are appended to the same history instead of forking a new one.
          sessionIdRef.current = null;
          threadIdRef.current = threadId;
          saveChatPointer(repositoryId, { sessionId: null, threadId });
        }
        setMessages(loaded);
        messagesRef.current = loaded;
        setSuggestedFollowups([]);
        setAnswerMode(null);
        setResearchProgress(null);
        setScanLog([]);
        setWebSources([]);
        setError(null);
      } catch (err) {
        setError((err as Error)?.message ?? "Failed to load conversation");
      }
    },
    [repositoryId]
  );

  return {
    messages,
    isStreaming,
    error,
    suggestedFollowups,
    answerMode,
    researchProgress,
    scanLog,
    webSources,
    sendMessage,
    clearError,
    clearConversation,
    loadThread,
  };
}
