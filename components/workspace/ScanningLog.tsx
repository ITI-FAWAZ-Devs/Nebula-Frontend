"use client";

import { useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ScanEvent } from "@/hooks/use-agent-chat";

interface ScanningLogProps {
  scanLog: ScanEvent[];
  isStreaming: boolean;
}

function fileName(filePath: string) {
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] || filePath;
}

export function ScanningLog({ scanLog, isStreaming }: ScanningLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scanLog.length]);

  return (
    <div className="flex h-full w-full flex-col border-l border-white/5 bg-slate-950/40">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/5 bg-black/40 px-4 py-3">
        {isStreaming ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
        ) : (
          <Search className="h-3.5 w-3.5 text-white/40" />
        )}
        <span className="font-display text-xs font-semibold text-white/80">
          Scanning codebase
        </span>
        {scanLog.length > 0 && (
          <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-[10px] font-mono text-sky-300">
            {scanLog.length} file{scanLog.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed no-scrollbar">
        {scanLog.length === 0 ? (
          <div className="flex items-center gap-2 text-sky-400/80 py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Searching the codebase…</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {scanLog.map((event, i) => (
              <motion.div
                key={`${event.filePath}-${i}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-baseline gap-2 py-0.5 text-white/55"
              >
                <span className="text-sky-400/80 shrink-0">&gt;</span>
                <span className="text-white/40 shrink-0">Scanning</span>
                <span className="text-sky-200 truncate" title={event.filePath}>
                  {fileName(event.filePath)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
