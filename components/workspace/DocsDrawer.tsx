"use client";

import { FileCode2, Layers, GitBranch, Sparkles } from "lucide-react";
import { DrawerShell } from "./DrawerShell";
import { Planet } from "./types";

interface DocsDrawerProps {
  planet: Planet | null;
  open: boolean;
  onClose: () => void;
  planets: Planet[];
}

export function DocsDrawer({ planet, open, onClose, planets }: DocsDrawerProps) {
  if (!planet) return null;
  return (
    <DrawerShell side="right" open={open} onClose={onClose} label="Documentation">
      <div className="border-b border-white/5 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Documentation</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: planet.color, boxShadow: `0 0 12px ${planet.color}` }} />
          <h3 className="font-display text-2xl font-semibold text-white">{planet.name}</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{planet.desc}</p>
        <div className="mt-4 flex gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span><FileCode2 className="mr-1 inline h-3 w-3" />{planet.files} files</span>
          <span><Layers className="mr-1 inline h-3 w-3" />{planet.loc} LOC</span>
          <span><GitBranch className="mr-1 inline h-3 w-3" />main</span>
        </div>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm leading-relaxed scrollbar-thin">
        <section>
          <h4 className="mb-2 font-display text-base font-medium text-white">Overview</h4>
          <p className="text-muted-foreground">{planet.name} sits at the {planet.kind.toLowerCase()} layer. It exposes a typed surface that neighboring modules rely on and is continuously kept in sync by the Documentarian agent.</p>
        </section>
        <section>
          <h4 className="mb-2 font-display text-base font-medium text-white">Public API</h4>
          <pre className="overflow-x-auto rounded-lg border border-white/5 bg-black/30 p-4 font-mono text-[11px] leading-relaxed text-foreground/80">
{`export function createClient(config: Config): Client
export interface Client {
  request<T>(op: Operation): Promise<T>
  subscribe<T>(op: Operation): AsyncIterator<T>
}`}
          </pre>
        </section>
        <section>
          <h4 className="mb-2 font-display text-base font-medium text-white">Depends on</h4>
          <div className="flex flex-wrap gap-2">
            {planet.deps.length ? planet.deps.map(d => (
              <span key={d} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-white">
                {planets.find(p => p.id === d)?.name}
              </span>
            )) : <span className="text-muted-foreground">No internal dependencies.</span>}
          </div>
        </section>
        <section className="rounded-lg border border-primary/20 bg-primary/[0.06] p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-primary"><Sparkles className="h-3 w-3" /> Documentarian note</div>
          <p className="mt-2 text-sm text-foreground/80">3 new public exports were added in the last 24h. Documentation was regenerated automatically.</p>
        </section>
      </div>
    </DrawerShell>
  );
}
