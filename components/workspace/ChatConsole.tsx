"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Bot, User, ChevronRight, Send } from "lucide-react";
import { DrawerShell } from "./DrawerShell";
import { Planet } from "./types";

interface ChatConsoleProps {
  open: boolean;
  onClose: () => void;
  planet: Planet | null;
}

export function ChatConsole({ open, onClose, planet }: ChatConsoleProps) {
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset console messages when the active planet changes
  useEffect(() => {
    setMessages([
      { role: "agent", text: `Command console online. Ask me anything about ${planet?.name ?? "the galaxy"}.` },
    ]);
  }, [planet]);

  useEffect(() => { 
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" }); 
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const q = input;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { 
        role: "agent", 
        text: `In ${planet?.name ?? "the system"}, ${q.toLowerCase().includes("depend") ? "the primary dependencies are core and db — no cycles detected." : "I traced 4 relevant call sites and 2 tests. Opening them in context."}` 
      }]);
    }, 700);
  };

  return (
    <DrawerShell side="bottom" open={open} onClose={onClose} width="min(880px, 96vw)" label="Command console">
      <div className="flex items-center gap-2 border-b border-white/5 px-6 py-3">
        <span className="inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-nebula-cyan" />
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Command console · {planet?.name ?? "galaxy"}</div>
      </div>
      <div ref={scrollRef} className="max-h-[42vh] flex-1 space-y-4 overflow-y-auto p-6 scrollbar-thin">
        {messages.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 6 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${m.role === "user" ? "bg-white/10 text-white" : "bg-gradient-to-br from-nebula-blue to-nebula-purple text-white"}`}>
              {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm text-white ${m.role === "user" ? "bg-white/[0.06]" : "bg-white/[0.02] border border-white/5"}`}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-white/5 p-4">
        <div className="flex flex-1 items-center gap-2 rounded-md bg-white/5 px-3 py-2">
          <ChevronRight className="h-4 w-4 text-nebula-cyan" />
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask about ${planet?.name ?? "the galaxy"}…`}
            className="w-full bg-transparent font-mono text-sm placeholder:text-muted-foreground focus:outline-none text-white" 
          />
        </div>
        <button 
          type="submit" 
          className="rounded-md border border-white/10 bg-gradient-to-r from-nebula-blue/30 to-nebula-purple/30 p-2 text-white hover:from-nebula-blue/50 hover:to-nebula-purple/50 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </DrawerShell>
  );
}
