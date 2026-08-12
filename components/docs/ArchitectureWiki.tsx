"use client";

import { useState, useEffect, useRef, useMemo, useId } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  CheckCircle2,
  GitCommit,
  Clock,
  Shield,
  FileText,
  Send,
  Menu,
  ChevronDown,
  Hexagon,
  RefreshCw,
  Loader2,
  Plus,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArchDocData,
  ArchDocVersionSummary,
} from "@/hooks/use-arch-doc";
import { useAgentChat, type AgentCitation } from "@/hooks/use-agent-chat";
import type { Repository } from "@/hooks/use-repository";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ArchitectureWikiProps {
  repositoryId: string;
  repository?: Repository | null;
  data: ArchDocData;
  repoName?: string;
  versions: ArchDocVersionSummary[];
  activeVersion: ArchDocVersionSummary | null;
  selectedVersion: number;
  onVersionChange: (version: number) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}


// ─── Helpers ────────────────────────────────────────────────────────────────

function extractHeadings(md: string): { id: string; text: string; level: number }[] {
  const lines = md.split("\n");
  const headings: { id: string; text: string; level: number }[] = [];
  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      headings.push({ id, text, level });
    }
  }
  return headings;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(diff / 864e5);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "just now";
}

// ─── Mermaid Diagram ─────────────────────────────────────────────────────────

function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chart?.trim() || !containerRef.current) return;
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
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
        const { svg } = await mermaid.render(diagramId, chart.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Make the SVG fill its container width
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.removeAttribute("width");
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 font-mono text-[11px] text-rose-400">
        Diagram error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-lg border border-white/5 bg-black/30 p-4"
    />
  );
}

// ─── Markdown Components ─────────────────────────────────────────────────────

function buildMarkdownComponents(sectionKey: string) {
  return {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1
        id={slugify(String(children))}
        className="scroll-mt-24 text-2xl font-display font-semibold text-white mb-4 mt-8 first:mt-0"
      >
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        id={slugify(String(children))}
        className="scroll-mt-24 text-lg font-display font-semibold text-white/90 mb-3 mt-7 border-b border-white/5 pb-2"
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3
        id={slugify(String(children))}
        className="scroll-mt-24 text-base font-display font-medium text-white/80 mb-2 mt-5"
      >
        {children}
      </h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="space-y-1.5 mb-4 ml-1">{children}</ul>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
        <span>{children}</span>
      </li>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="text-white/90 font-medium">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="text-white/60 italic">{children}</em>
    ),
    code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
      const isMermaid = className === "language-mermaid";
      const isBlock = className?.includes("language-");
      if (isMermaid) {
        return <MermaidDiagram chart={String(children ?? "")} />;
      }
      if (isBlock) {
        return (
          <pre className="overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-foreground/80 mb-4">
            <code>{children}</code>
          </pre>
        );
      }
      return (
        <code className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-primary/90">
          {children}
        </code>
      );
    },
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-primary/40 pl-4 my-4 text-sm text-muted-foreground italic">
        {children}
      </blockquote>
    ),
  };
}

// ─── Dependency Graph Panel ───────────────────────────────────────────────────

function DependencyGraphPanel({ diagram }: { diagram: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-lg border border-white/5 bg-white/2 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <svg className="h-3 w-3 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Dependency Graph
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 pb-4 pt-4">
              <MermaidDiagram chart={diagram} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Source Files Badge ───────────────────────────────────────────────────────

function SourceFilesPanel({ files }: { files: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 rounded-lg border border-white/5 bg-white/2 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <FileText className="h-3 w-3" />
          {files.length} source file{files.length !== 1 ? "s" : ""}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
              {files.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60"
                >
                  <FileText className="h-2.5 w-2.5 text-primary/50" />
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Citation Badges ────────────────────────────────────────────────────────

function buildGithubBlobUrl(
  citation: AgentCitation,
  repository?: Repository | null
): string | null {
  if (!repository) return null;
  const { owner, name, defaultBranch } = repository;
  if (!owner || !name) return null;
  const base = `https://github.com/${owner}/${name}/blob/${defaultBranch}/${citation.filePath}`;
  if (citation.lineRange) {
    const [start, end] = citation.lineRange.split("-");
    return `${base}#L${start}${end ? `-L${end}` : ""}`;
  }
  return base;
}

function CitationBadges({
  citations,
  repository,
}: {
  citations: AgentCitation[];
  repository?: Repository | null;
}) {
  if (!citations.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((c, i) => {
        const href = buildGithubBlobUrl(c, repository);
        const label = c.filePath.split("/").slice(-1)[0] ?? c.filePath;
        const title = c.lineRange ? `${c.filePath}:${c.lineRange}` : c.filePath;
        const inner = (
          <>
            <FileText className="h-2.5 w-2.5 text-primary/50 shrink-0" />
            {label}
            {c.lineRange && (
              <span className="text-white/30">:{c.lineRange}</span>
            )}
          </>
        );
        if (href) {
          return (
            <a
              key={`${c.nodeId}-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60 hover:border-primary/40 hover:text-white/90 transition-colors"
            >
              {inner}
            </a>
          );
        }
        return (
          <span
            key={`${c.nodeId}-${i}`}
            title={title}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/60"
          >
            {inner}
          </span>
        );
      })}
    </div>
  );
}

// ─── Chat Markdown Components ──────────────────────────────────────────────────

const chatMdComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  a: ({ children, href }: any) => (
    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  code: ({ children, className }: any) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] my-2 text-foreground/80 scrollbar-thin">
          <code>{children}</code>
        </pre>
      );
    }
    return <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px]">{children}</code>;
  },
  ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function ArchitectureWiki({
  repositoryId,
  repository,
  data,
  repoName = "product-list-app",
  versions,
  activeVersion,
  selectedVersion,
  onVersionChange,
  onRegenerate,
  isRegenerating,
}: ArchitectureWikiProps) {
  const [activeSection, setActiveSection] = useState(data.sections[0]?.key ?? "");
  const [activeHeading, setActiveHeading] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatExpanded, setChatExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { messages, isStreaming, error, sendMessage, clearError } =
    useAgentChat(repositoryId);

  // Expand chat when messages exist
  useEffect(() => {
    if (messages.length > 0) setChatExpanded(true);
  }, [messages.length]);

  // Toast errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages]);


  const currentSection = useMemo(
    () => data.sections.find((s) => s.key === activeSection) ?? data.sections[0],
    [activeSection, data.sections]
  );

  const tocHeadings = useMemo(
    () => (currentSection ? extractHeadings(currentSection.contentMd) : []),
    [currentSection]
  );

  // Track active heading on scroll
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const headingEls = el.querySelectorAll("h1[id],h2[id],h3[id]");
      let current = "";
      for (const h of headingEls) {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 120) current = h.id;
      }
      setActiveHeading(current);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeSection]);

  // Reset scroll & heading when section changes
  useEffect(() => {
    setActiveHeading("");
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  const scrollToHeading = (id: string) => {
    const el = contentRef.current?.querySelector(`#${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const latestVersion = versions[0]?.version ?? data.version;
  const shortSha = data.commitSha ? data.commitSha.slice(0, 7) : "n/a";
  const mdComponents = useMemo(
    () => buildMarkdownComponents(activeSection),
    [activeSection]
  );

  const handleSendMessage = async () => {
    const q = chatInput.trim();
    if (!q || isStreaming) return;
    if (q.length > 4000) {
      toast.error("Question must be 4000 characters or fewer");
      return;
    }
    setChatInput("");
    await sendMessage(q);
  };

  const chatDisabled = !repositoryId || isStreaming;

  const handleOpenVoice = () => {
    router.push(`/voice?repoId=${repositoryId}&repo=${encodeURIComponent(repoName ?? "")}`);
  };

  return (
    <div className="flex h-full flex-col text-foreground">
      {/* ── App header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-background/70 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex h-6 w-6 items-center justify-center">
              <Hexagon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#4493F8", boxShadow: "0 0 8px #4493F8e6" }} />
              </div>
            </div>
            <span className="font-display text-base font-semibold text-white">Nebula</span>
          </Link>
          <span className="h-4 w-px bg-white/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Architecture Wiki
          </span>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
            <GitCommit className="h-3 w-3" />
            <span className="text-primary/70">{shortSha}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">Verified</span>
            <span className="text-white/20">·</span>
            <span>score {data.verificationScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{data.generatedAt ? timeAgo(data.generatedAt) : "—"}</span>
          </div>
          <Select
            value={selectedVersion.toString()}
            onValueChange={(value) => value && onVersionChange(Number(value))}
          >
            <SelectTrigger className="h-7 border-white/10 bg-white/5 px-2.5 font-mono text-[10px] uppercase tracking-wider text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10 bg-popover/95 font-mono text-white">
              {isRegenerating && activeVersion && (
                <SelectItem
                  key={`active-${activeVersion.version}`}
                  value={`active-${activeVersion.version}`}
                  disabled
                  className="text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Regenerating v{activeVersion.version}…
                  </span>
                </SelectItem>
              )}
              {versions.map((v) => (
                <SelectItem
                  key={v.version}
                  value={v.version.toString()}
                  className="text-[10px] uppercase tracking-wider"
                >
                  {v.version === latestVersion ? "Latest" : `v${v.version}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isRegenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </header>

      {/* ── Sub header (sidebar toggle + breadcrumb) ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/5 bg-background/50 px-4 py-2 backdrop-blur-sm">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="font-mono text-primary/60 uppercase tracking-wider">{repoName}</span>
          <ChevronRight className="h-3 w-3 text-white/20" />
          <span>{currentSection?.title}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="shrink-0 overflow-hidden border-r border-white/5 bg-background/40 backdrop-blur-sm"
            >
              <div className="flex h-full w-60 flex-col overflow-y-auto py-4 scrollbar-thin">
                <div className="mb-3 px-4 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
                  Sections
                </div>
                <nav className="flex flex-col gap-0.5 px-2">
                  {data.sections.map((section) => {
                    const isActive = section.key === activeSection;
                    const headings = extractHeadings(section.contentMd).filter(
                      (h) => h.level === 2
                    );
                    return (
                      <div key={section.key}>
                        <button
                          onClick={() => setActiveSection(section.key)}
                          className={cn(
                            "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-all duration-150 cursor-pointer",
                            isActive
                              ? "bg-primary/10 text-white"
                              : "text-muted-foreground hover:bg-white/5 hover:text-white/80"
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 shrink-0 transition-transform duration-150",
                              isActive ? "rotate-90 text-primary" : "text-muted-foreground/40"
                            )}
                          />
                          <span className="truncate font-medium text-[13px]">
                            {section.title}
                          </span>
                          {section.verified && (
                            <CheckCircle2 className="ml-auto h-3 w-3 shrink-0 text-emerald-500/70" />
                          )}
                        </button>
                        {isActive && headings.length > 0 && (
                          <div className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l border-white/5 pl-3">
                            {headings.map((h) => (
                              <button
                                key={h.id}
                                onClick={() => scrollToHeading(h.id)}
                                className={cn(
                                  "truncate rounded py-1 px-2 text-left text-[11px] transition-colors cursor-pointer",
                                  activeHeading === h.id
                                    ? "text-primary"
                                    : "text-muted-foreground/60 hover:text-white/70"
                                )}
                              >
                                {h.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {currentSection && (
            <div className="mx-auto max-w-3xl px-8 py-8">
              {/* Section heading */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-white">
                  {currentSection.title}
                </h2>
                {currentSection.verified && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="h-2.5 w-2.5" /> verified
                  </span>
                )}
              </div>

              {/* Markdown content */}
              <article className="min-w-0">
                <ReactMarkdown components={mdComponents as Record<string, React.ElementType>}>
                  {currentSection.contentMd}
                </ReactMarkdown>
              </article>

              {/* Dependency Graph */}
              {currentSection.diagramMermaid && (
                <DependencyGraphPanel diagram={currentSection.diagramMermaid} />
              )}

              {/* Source files */}
              <SourceFilesPanel files={currentSection.sourceFiles} />
            </div>
          )}
        </main>

        {/* ── Right TOC ── */}
        {tocHeadings.length > 1 && (
          <aside className="hidden w-52 shrink-0 border-l border-white/5 lg:block">
            <div className="sticky top-0 overflow-y-auto py-6 pl-4 pr-3 scrollbar-thin">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
                On this page
              </div>
              <nav className="flex flex-col gap-0.5">
                {tocHeadings.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => scrollToHeading(h.id)}
                    className={cn(
                      "rounded px-2 py-1 text-left transition-colors duration-150 cursor-pointer",
                      h.level === 1 && "font-medium",
                      h.level === 2 && "pl-3",
                      h.level === 3 && "pl-5",
                      activeHeading === h.id
                        ? "text-primary text-[12px]"
                        : "text-muted-foreground/60 hover:text-white/70 text-[11px]"
                    )}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* ── Bottom Panel — unified ChatGPT-style bar ── */}
      <div className="shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl flex flex-col w-full">


          {/* ── Text chat conversation area ── */}
          <AnimatePresence>
            {(chatExpanded || messages.length > 0) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "38vh", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-b border-white/5"
              >
                <div
                  ref={chatScrollRef}
                  className="h-full w-full overflow-y-auto px-4 py-4 scrollbar-thin flex flex-col gap-4"
                >
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        m.role === "user" ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm shadow-sm",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/5 text-foreground border border-white/10"
                        )}
                      >
                        {m.role === "assistant" && !m.isStreaming ? (
                          <ReactMarkdown components={chatMdComponents}>
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                        )}
                        {m.isStreaming && m.content.length === 0 && (
                          <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>
                      {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                        <CitationBadges citations={m.citations} repository={repository} />
                      )}
                      {m.failed && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Message failed to complete
                        </div>
                      )}
                    </div>
                  ))}
                  {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex flex-col max-w-[85%] self-start items-start">
                      <div className="rounded-2xl px-4 py-3 text-sm shadow-sm bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Unified ChatGPT-style input bar ── */}
          <div className="px-4 py-3">
            <div
              className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-sm focus-within:border-white/20 transition-colors"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
            >
              {/* + */}
              <button className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/35 hover:text-white/65 transition-colors">
                <Plus className="h-3 w-3" />
              </button>

              {/* Text input */}
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onFocus={() => setChatExpanded(true)}
                placeholder={`Ask anything about ${repoName}…`}
                className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/25 outline-none disabled:opacity-40"
                disabled={chatDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              {/* Think badge */}
              <button className="shrink-0 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/30 hover:text-white/55 transition-colors">
                <Cpu className="h-2.5 w-2.5" />
                <span className="text-[10px] font-medium">Think</span>
              </button>

              {/* Send (when typed) OR voice button that opens full-screen voice page */}
              {chatInput.trim() ? (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleOpenVoice}
                  title="Open voice mode"
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 shadow-[0_0_12px_2px_rgba(68,147,248,0.4)]"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
                    <rect x="2"   y="8" width="2" height="4" rx="1" />
                    <rect x="5.5" y="5" width="2" height="10" rx="1" />
                    <rect x="9"   y="3" width="2" height="14" rx="1" />
                    <rect x="12.5" y="5" width="2" height="10" rx="1" />
                    <rect x="16"  y="8" width="2" height="4" rx="1" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
