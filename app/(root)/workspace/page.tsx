"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { 
  Search, 
  MessageSquare, 
  BookOpen, 
  History, 
  Cpu, 
  Activity, 
  Circle, 
  ChevronRight 
} from "lucide-react";

import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";
import { Galaxy } from "@/components/workspace/Galaxy";
import { PlanetNode } from "@/components/workspace/PlanetNode";
import { DockButton } from "@/components/workspace/DockButton";
import { DocsDrawer } from "@/components/workspace/DocsDrawer";
import { ChatConsole } from "@/components/workspace/ChatConsole";
import { SearchPalette } from "@/components/workspace/SearchPalette";
import { HistoryTimeline } from "@/components/workspace/HistoryTimeline";

import { PLANETS } from "@/components/workspace/constants";
import { DrawerType } from "@/components/workspace/types";

export default function WorkspacePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerType>(null);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 1400);
    
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { 
        e.preventDefault(); 
        setDrawer("search"); 
      }
      if (e.key === "Escape") {
        setDrawer(null);
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => { 
      clearTimeout(t); 
      window.removeEventListener("keydown", onKey); 
    };
  }, []);

  const planet = PLANETS.find(p => p.id === selected) ?? null;

  const openPlanet = (id: string) => {
    setSelected(id);
    setDrawer("docs");
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-foreground bg-background">
      <NebulaBackdrop />

      {/* Top status bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold text-white">
            Nebula
          </Link>
          <span className="mx-2 h-4 w-px bg-white/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">acme/orion-core · main</span>
          <div className="ml-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 4 agents online
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
          <Cpu className="h-3 w-3" /> galaxy synced 2s ago
        </div>
      </header>

      {/* Galaxy */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {entering && (
            <motion.div 
              initial={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-xl"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto h-24 w-24 rounded-full bg-primary shadow-[0_0_80px_#4493F8]" 
                />
                <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Welcome to the galaxy</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Galaxy planets={PLANETS} selected={selected} />
        
        {PLANETS.map((p, i) => (
          <PlanetNode 
            key={p.id} 
            p={p} 
            index={i} 
            selected={selected === p.id} 
            onSelect={() => openPlanet(p.id)} 
          />
        ))}
      </div>

      {/* Floating dock */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }} 
        animate={{ y: 0, opacity: entering ? 0 : 1 }} 
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="premium-panel flex items-center gap-1 p-1.5">
          <DockButton icon={Search} label="Search" hotkey="⌘K" onClick={() => setDrawer("search")} />
          <DockButton icon={MessageSquare} label="Console" onClick={() => setDrawer("chat")} />
          <DockButton icon={BookOpen} label="Docs" onClick={() => { if (!planet) setSelected("core"); setDrawer("docs"); }} />
          <DockButton icon={History} label="Memory" onClick={() => setDrawer("history")} />
        </div>
      </motion.div>

      {/* Ambient module inspector (bottom-left) */}
      <AnimatePresence>
        {planet && !entering && drawer === null && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-6 z-10 max-w-xs"
          >
            <div className="premium-panel p-4">
              <div className="flex items-center gap-2">
                <Circle className="h-2.5 w-2.5 fill-current" style={{ color: planet.color }} />
                <div className="font-display text-sm font-medium text-white">{planet.name}</div>
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{planet.kind}</div>
              <p className="mt-2 text-xs text-muted-foreground">{planet.desc}</p>
              <button 
                onClick={() => setDrawer("docs")}
                className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:text-white cursor-pointer"
              >
                Open docs <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawers */}
      <DocsDrawer 
        planet={planet} 
        open={drawer === "docs"} 
        onClose={() => setDrawer(null)} 
        planets={PLANETS} 
      />
      <ChatConsole 
        planet={planet} 
        open={drawer === "chat"} 
        onClose={() => setDrawer(null)} 
      />
      <SearchPalette 
        open={drawer === "search"} 
        onClose={() => setDrawer(null)} 
        onSelect={openPlanet} 
        planets={PLANETS} 
      />
      <HistoryTimeline 
        open={drawer === "history"} 
        onClose={() => setDrawer(null)} 
      />
    </div>
  );
}
