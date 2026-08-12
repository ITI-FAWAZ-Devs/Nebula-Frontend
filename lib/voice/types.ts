export type VoiceUiState = "idle" | "listening" | "processing" | "speaking";

export interface AgentCitation {
  filePath: string;
  lineRange: string | null;
  nodeId: string;
}

export interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations: AgentCitation[];
}

// ─── Socket.IO events: client → server ────────────────────────────────────

export interface SessionStartPayload {
  repositoryId: string;
}

// ─── Socket.IO events: server → client ────────────────────────────────────

export interface StateEvent {
  state: VoiceUiState;
}

export interface SttPartialEvent {
  text: string;
}

export interface SttFinalEvent {
  text: string;
}

export interface AgentTokenEvent {
  token: string;
}

export interface AgentDoneEvent {
  answer: string;
  citations: AgentCitation[];
  citedNodeIds: string[];
  toolsUsed: string[];
}

export interface ErrorEvent {
  message: string;
}
