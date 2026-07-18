"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import { DrawerShell } from "./DrawerShell";
import { Planet } from "./types";

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  planets: Planet[];
}

export function SearchPalette({ open, onClose, onSelect, planets }: SearchPaletteProps) {
  const [q, setQ] = useState("");
  const results = planets.filter(p => p.name.includes(q.toLowerCase()) || p.kind.toLowerCase().includes(q.toLowerCase()));
  
  useEffect(() => { 
    if (open) setQ(""); 
  }, [open]);

  return (
    <DrawerShell side="center" open={open} onClose={onClose} width="min(640px, 92vw)" label="Command palette">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input 
          autoFocus 
          value={q} 
          onChange={e => setQ(e.target.value)}
          placeholder="Search modules, files, symbols…"
          className="w-full bg-transparent font-display text-lg placeholder:text-muted-foreground focus:outline-none text-white" 
        />
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
        {results.map(p => (
          <button 
            key={p.id} 
            onClick={() => { onSelect(p.id); onClose(); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/5 cursor-pointer"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
            <div className="flex-1">
              <div className="font-display text-sm text-white">{p.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.kind}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
        {results.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Nothing matches "{q}"</div>}
      </div>
    </DrawerShell>
  );
}
