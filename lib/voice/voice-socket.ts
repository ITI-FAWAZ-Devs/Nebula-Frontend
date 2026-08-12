"use client";

import { io, Socket } from "socket.io-client";
import type {
  StateEvent,
  SttPartialEvent,
  SttFinalEvent,
  AgentTokenEvent,
  AgentDoneEvent,
  ErrorEvent,
} from "./types";

export type VoiceSocketEvents = {
  state: (e: StateEvent) => void;
  "stt.partial": (e: SttPartialEvent) => void;
  "stt.final": (e: SttFinalEvent) => void;
  "agent.token": (e: AgentTokenEvent) => void;
  "agent.done": (e: AgentDoneEvent) => void;
  "tts.audio": (chunk: ArrayBuffer) => void;
  error: (e: ErrorEvent) => void;
};

let _socket: Socket | null = null;

/**
 * Returns a singleton voice Socket.IO connection.
 *
 * Authentication is handled in two complementary ways:
 *  1. The `nebula_access_token` HttpOnly cookie is sent automatically with the
 *     WebSocket upgrade request (requires withCredentials: true).
 *  2. If the frontend has the token in memory it is also sent in `auth.token`
 *     as a belt-and-suspenders fallback.
 */
export function getVoiceSocket(token?: string | null): Socket {
  if (_socket?.connected) return _socket;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  _socket = io(`${apiUrl}/voice`, {
    // Pass the token when we have it; backend also reads the cookie.
    auth: token ? { token } : {},
    transports: ["websocket"],
    withCredentials: true, // sends HttpOnly cookies with the WS upgrade
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  return _socket;
}

export function destroyVoiceSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
