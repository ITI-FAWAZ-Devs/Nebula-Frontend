"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store";
import { api } from "@/utils/api";
import { getVoiceSocket, destroyVoiceSocket } from "@/lib/voice/voice-socket";
import type {
  VoiceUiState,
  VoiceMessage,
  AgentCitation,
  AgentDoneEvent,
  ConversationSavedEvent,
} from "@/lib/voice/types";

/** Ensure a valid access token is in the store, refreshing via cookie if needed. */
async function ensureAccessToken(): Promise<string | null> {
  const stored = useAuthStore.getState().accessToken;
  if (stored) return stored;

  // Providers.tsx already fires a proactive refresh on mount, so reaching
  // here means that call hasn't resolved yet (fast click) or failed.
  // Try once more before giving up.
  try {
    const response = await api.post("/api/auth/refresh");
    const { accessToken } = response.data?.data ?? {};
    if (accessToken) {
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken as string;
    }
    return null;
  } catch {
    return null;
  }
}

/** Sample rate for recording — must match Whisper's expected input rate */
const RECORD_SAMPLE_RATE = 16000;
/** Sample rate for Piper TTS output — read from the model's onnx.json */
const PIPER_SAMPLE_RATE = parseInt(
  process.env.NEXT_PUBLIC_PIPER_SAMPLE_RATE ?? "22050",
  10,
);
/** RMS above this = user is speaking (silence VAD, listening mode) */
const SPEECH_RMS_THRESHOLD = 0.008;
/** RMS above this while agent is speaking = barge-in */
const BARGE_IN_RMS_THRESHOLD = 0.02;
/** Milliseconds of silence after speech before auto-committing an utterance */
const SILENCE_COMMIT_MS = 1400;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Inline AudioWorklet processor source (injected as a Blob URL) ────────

const WORKLET_SRC = /* js */ `
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (ch) {
      // Convert Float32 → Int16
      const i16 = new Int16Array(ch.length);
      for (let i = 0; i < ch.length; i++) {
        i16[i] = Math.max(-32768, Math.min(32767, ch[i] * 32767));
      }
      this.port.postMessage(i16.buffer, [i16.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
`;

export function useVoiceAgent(repositoryId: string | null) {
  const [uiState, setUiState] = useState<VoiceUiState>("idle");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [partialTranscript, setPartialTranscript] = useState<string>("");
  const [streamingAnswer, setStreamingAnswer] = useState<string>("");
  /** Conversation thread the current voice session is being saved to */
  const [threadId, setThreadId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Playback queue
  const playbackQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Barge-in + silence analyser (shared AnalyserNode)
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bargeInRef = useRef(false);
  const bargeInRafRef = useRef<number | null>(null);

  // Silence VAD (listening mode → auto-commit)
  const silenceRafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpeechRef = useRef(false);

  // Set to true when backend sends state:listening while audio is still playing.
  // playNextChunk drains the queue and then switches the UI to listening.
  const pendingListenRef = useRef(false);

  const uiStateRef = useRef<VoiceUiState>("idle");
  uiStateRef.current = uiState;

  // ─── Socket setup ─────────────────────────────────────────────────────────

  const setupSocket = useCallback(
    (token?: string | null) => {
      const socket = getVoiceSocket(token);
      socketRef.current = socket;

      socket.on("state", ({ state }: { state: VoiceUiState }) => {
        if (state === "listening" && isPlayingRef.current) {
          // Backend finished generating TTS but frontend is still playing.
          // Defer the UI switch to listening until the queue drains so the
          // user hears the full response. playNextChunk handles the transition.
          pendingListenRef.current = true;
          return;
        }

        pendingListenRef.current = false;
        setUiState(state);

        if (state === "idle") {
          // Session ended — kill any remaining audio
          stopPlayback();
        }

        // When returning to listening, restart silence VAD on the shared analyser
        if (state === "listening" && analyserRef.current) {
          stopSilenceVAD();
          startSilenceVAD(analyserRef.current, socket);
        }
      });

      socket.on("stt.partial", ({ text }: { text: string }) => {
        // Skip internal byte-count partials
        if (!text.startsWith("__bytes:")) {
          setPartialTranscript(text);
        }
      });

      socket.on("stt.final", ({ text }: { text: string }) => {
        setPartialTranscript("");
        setMessages((prev) => [
          ...prev,
          { id: generateId(), role: "user", text, citations: [] },
        ]);
      });

      socket.on("agent.token", ({ token: tok }: { token: string }) => {
        setStreamingAnswer((prev) => prev + tok);
      });

      socket.on("agent.done", (payload: AgentDoneEvent) => {
        const citations: AgentCitation[] = payload.citations ?? [];
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            text: payload.answer,
            citations,
          },
        ]);
        setStreamingAnswer("");
      });

      socket.on("tts.audio", (chunk: ArrayBuffer) => {
        enqueueAudio(chunk);
      });

      socket.on("conversation.saved", (payload: ConversationSavedEvent) => {
        setThreadId(payload.threadId);
      });

      socket.on("error", ({ message }: { message: string }) => {
        setError(message);
      });

      return socket;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─── Audio playback ───────────────────────────────────────────────────────

  function enqueueAudio(chunk: ArrayBuffer) {
    playbackQueueRef.current.push(chunk);
    if (!isPlayingRef.current) {
      playNextChunk();
    }
  }

  function stopPlayback() {
    isPlayingRef.current = false;
    playbackQueueRef.current = [];
    try {
      playbackSourceRef.current?.stop();
    } catch {
      // already stopped
    }
    playbackSourceRef.current = null;
  }

  async function playNextChunk() {
    const chunk = playbackQueueRef.current.shift();

    if (!chunk) {
      // Queue drained — check whether the backend already signalled listening
      isPlayingRef.current = false;
      if (pendingListenRef.current) {
        pendingListenRef.current = false;
        setUiState("listening");
        if (analyserRef.current && socketRef.current) {
          stopSilenceVAD();
          startSilenceVAD(analyserRef.current, socketRef.current);
        }
      }
      return;
    }

    isPlayingRef.current = true;

    if (!playbackCtxRef.current || playbackCtxRef.current.state === "closed") {
      // Use Piper's native sample rate so audio plays at the correct speed
      playbackCtxRef.current = new AudioContext({ sampleRate: PIPER_SAMPLE_RATE });
    }
    const ctx = playbackCtxRef.current;

    // Resume in case browser suspended the context (autoplay policy)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    try {
      // Piper outputs raw signed 16-bit LE PCM — decode manually
      const i16 = new Int16Array(chunk);
      const f32 = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) {
        f32[i] = i16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, f32.length, PIPER_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(f32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      playbackSourceRef.current = source;

      source.onended = () => {
        if (isPlayingRef.current) {
          playNextChunk();
        }
      };

      source.start();
    } catch {
      isPlayingRef.current = false;
    }
  }

  // ─── Barge-in VAD ────────────────────────────────────────────────────────

  function startBargeInDetection(analyser: AnalyserNode) {
    const data = new Float32Array(analyser.fftSize);
    bargeInRef.current = false;

    const check = () => {
      if (uiStateRef.current !== "speaking") {
        bargeInRafRef.current = null;
        return;
      }
      analyser.getFloatTimeDomainData(data);
      const rms = Math.sqrt(
        data.reduce((sum, v) => sum + v * v, 0) / data.length
      );
      if (rms > BARGE_IN_RMS_THRESHOLD && !bargeInRef.current) {
        bargeInRef.current = true;
        handleInterrupt();
      }
      bargeInRafRef.current = requestAnimationFrame(check);
    };

    bargeInRafRef.current = requestAnimationFrame(check);
  }

  // ─── Silence VAD (auto-commit) ────────────────────────────────────────────

  function startSilenceVAD(analyser: AnalyserNode, socket: Socket) {
    const data = new Float32Array(analyser.fftSize);
    hasSpeechRef.current = false;

    const tick = () => {
      if (uiStateRef.current !== "listening") {
        silenceRafRef.current = null;
        return;
      }

      analyser.getFloatTimeDomainData(data);
      const rms = Math.sqrt(
        data.reduce((sum, v) => sum + v * v, 0) / data.length
      );

      if (rms > SPEECH_RMS_THRESHOLD) {
        // Active speech detected
        hasSpeechRef.current = true;
        if (silenceTimerRef.current !== null) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (hasSpeechRef.current && silenceTimerRef.current === null) {
        // Silence after speech — start commit countdown
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          hasSpeechRef.current = false;
          if (uiStateRef.current === "listening") {
            socket.emit("utterance.end");
          }
        }, SILENCE_COMMIT_MS);
      }

      silenceRafRef.current = requestAnimationFrame(tick);
    };

    silenceRafRef.current = requestAnimationFrame(tick);
  }

  function stopSilenceVAD() {
    if (silenceRafRef.current !== null) {
      cancelAnimationFrame(silenceRafRef.current);
      silenceRafRef.current = null;
    }
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    hasSpeechRef.current = false;
  }

  // ─── Microphone capture ───────────────────────────────────────────────────

  async function startMicCapture(socket: Socket) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: RECORD_SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    streamRef.current = stream;

    const ctx = new AudioContext({ sampleRate: RECORD_SAMPLE_RATE });
    audioCtxRef.current = ctx;

    // Analyser for barge-in
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyserRef.current = analyser;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    // Load worklet
    const blob = new Blob([WORKLET_SRC], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    await ctx.audioWorklet.addModule(blobUrl);
    URL.revokeObjectURL(blobUrl);

    const worklet = new AudioWorkletNode(ctx, "pcm-capture-processor");
    workletNodeRef.current = worklet;

    worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      if (uiStateRef.current === "listening") {
        socket.emit("audio.chunk", e.data);
      } else if (uiStateRef.current === "speaking") {
        // Barge-in detection done by analyser, but still forward audio
        // so STT is ready to transcribe immediately after interrupt
        socket.emit("audio.chunk", e.data);
      }
    };

    source.connect(worklet);
    worklet.connect(ctx.destination);
  }

  function stopMicCapture() {
    stopSilenceVAD();
    if (bargeInRafRef.current !== null) {
      cancelAnimationFrame(bargeInRafRef.current);
      bargeInRafRef.current = null;
    }
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (!repositoryId) return;
    setError(null);
    setMessages([]);
    setStreamingAnswer("");
    setThreadId(null);

    // Best-effort: get an in-memory token so the backend has two auth paths.
    // Even if this returns null, the HttpOnly cookie sent by withCredentials
    // will authenticate the WebSocket upgrade on the server side.
    const token = await ensureAccessToken();

    const socket = setupSocket(token);
    socketRef.current = socket;

    try {
      // Wait for socket connection before emitting session.start
      await new Promise<void>((resolve, reject) => {
        if (socket.connected) {
          resolve();
          return;
        }
        socket.once("connect", resolve);
        socket.once("connect_error", (err) => {
          const msg =
            (err as Error & { message?: string })?.message ??
            "Connection failed";
          setError(
            msg.toLowerCase().includes("unauthorized") ||
              msg.includes("401")
              ? "Not authenticated — please log in again"
              : `Could not connect to voice server: ${msg}`,
          );
          reject(err);
        });
        setTimeout(() => reject(new Error("timeout")), 8000);
      });

      socket.emit("session.start", { repositoryId });

      await startMicCapture(socket);
      if (analyserRef.current) {
        startSilenceVAD(analyserRef.current, socket);
        startBargeInDetection(analyserRef.current);
      }
    } catch (err) {
      const errMsg = (err as Error)?.message ?? "";
      // setError was already called for connection errors; only set for mic
      if (errMsg === "timeout" || errMsg.includes("mic") || errMsg.includes("NotAllowed")) {
        setError("Microphone access denied");
      }
      socket.emit("session.stop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryId, setupSocket]);

  const stop = useCallback(() => {
    socketRef.current?.emit("session.stop");
    stopMicCapture();
    stopPlayback();
    destroyVoiceSocket();
    socketRef.current = null;
    setUiState("idle");
    setPartialTranscript("");
    setStreamingAnswer("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInterrupt = useCallback(() => {
    stopPlayback();
    socketRef.current?.emit("interrupt");
    bargeInRef.current = false;
  }, []);

  const commitUtterance = useCallback(() => {
    socketRef.current?.emit("utterance.end");
  }, []);

  /** Send typed text directly to the agent, bypassing STT */
  const sendText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !socketRef.current?.connected) return;
    socketRef.current.emit("text.utterance", { text: trimmed });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicCapture();
      stopPlayback();
      destroyVoiceSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    uiState,
    messages,
    error,
    partialTranscript,
    streamingAnswer,
    threadId,
    start,
    stop,
    interrupt: handleInterrupt,
    commitUtterance,
    sendText,
  };
}
