"use client";

import { useState, useEffect, useRef, useId } from "react";
import { ChevronDown, ChevronUp, Code2, AlertTriangle } from "lucide-react";

function sanitizeMermaidChart(chart: string): string {
  if (!chart) return "";
  let clean = chart.trim();

  // 1. Convert markdown link patterns inside node definitions:
  // e.g. node[`main.js`](https://github.com/...) -> node["main.js"]
  // e.g. node[main.js](https://github.com/...) -> node["main.js"]
  clean = clean.replace(/\[\s*`?([^`\]]+)`?\s*\]\([^)]+\)/g, '["$1"]');

  // 2. Remove inline code backticks in diagram labels:
  // e.g. `main.js` -> main.js
  clean = clean.replace(/`([^`]+)`/g, "$1");

  // 3. Remove raw HTML anchor tags:
  clean = clean.replace(/<a\s+[^>]*>(.*?)<\/a>/gi, "$1");

  // 4. Fix orphan markdown links:
  clean = clean.replace(/\((https?:\/\/[^\s)]+)\)/g, "");

  // 5. Ensure valid diagram type header if missing:
  const firstWord = clean.trim().split(/\s+/)[0];
  const validHeaders = [
    "graph",
    "flowchart",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "erDiagram",
    "gantt",
    "pie",
    "gitGraph",
    "architecture",
    "C4Context",
    "mindmap",
    "timeline",
  ];

  if (!validHeaders.includes(firstWord)) {
    clean = `flowchart TD\n${clean}`;
  }

  return clean;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!chart?.trim() || !containerRef.current) return;
    let cancelled = false;

    async function render() {
      setError(null);
      const cleanedChart = sanitizeMermaidChart(chart);

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          suppressErrorRendering: true,
          themeVariables: {
            background: "transparent",
            primaryColor: "#4493F8",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "rgba(255,255,255,0.08)",
            lineColor: "rgba(255,255,255,0.25)",
            secondaryColor: "rgba(255,255,255,0.05)",
            tertiaryColor: "rgba(255,255,255,0.03)",
            edgeLabelBackground: "rgba(0,0,0,0.6)",
            clusterBkg: "rgba(255,255,255,0.04)",
            fontFamily: "ui-monospace, monospace",
            fontSize: "13px",
          },
        });

        const diagramId = `mermaid-${id}`;
        
        let svg = "";
        try {
          const res = await mermaid.render(diagramId, cleanedChart);
          svg = res.svg;
        } catch (firstErr) {
          // Secondary fallback: strip all parentheses & special chars from labels
          const aggressiveClean = cleanedChart
            .replace(/\((https?:\/\/[^\s)]+)\)/g, "")
            .replace(/\[([^\]]+)\]\((.*?)\)/g, '["$1"]');
            
          const res = await mermaid.render(`${diagramId}-retry`, aggressiveClean);
          svg = res.svg;
        }

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.removeAttribute("width");
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.warn("Mermaid rendering failed:", err);
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-4 rounded-xl border border-white/10 bg-black/40 p-4 text-xs font-mono">
        <div className="flex items-center justify-between gap-3 text-amber-400/90 mb-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Diagram Preview Unavailable</span>
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <Code2 className="h-3 w-3" />
            {showRaw ? "Hide Code" : "View Raw Code"}
            {showRaw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showRaw ? (
          <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/60 p-3 text-[11px] text-white/80 scrollbar-thin">
            <code>{chart}</code>
          </pre>
        ) : (
          <p className="text-white/50 text-[11px]">
            The diagram contained complex formatting syntax. Click &ldquo;View Raw Code&rdquo; above to view the graph definition.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-xl border border-white/8 bg-black/40 p-4 transition-all"
    />
  );
}
