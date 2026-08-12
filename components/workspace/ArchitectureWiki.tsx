"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronRight, CheckCircle2, Menu } from "lucide-react";
import { toast } from "sonner";
import type {
  ArchDocData,
  ArchDocVersionSummary,
} from "@/hooks/use-arch-doc";
import { useAgentChat } from "@/hooks/use-agent-chat";

import { getGithubFileUrl, preprocessMarkdownFileLinks } from "./github-utils";
import { extractHeadings } from "./wiki-helpers";
import { buildMarkdownComponents } from "./wiki-markdown";
import { DependencyGraphPanel, SourceFilesPanel } from "./Panels";
import { ArchitectureWikiHeader } from "./ArchitectureWikiHeader";
import { ArchitectureWikiSidebar } from "./ArchitectureWikiSidebar";
import { ArchitectureWikiToc } from "./ArchitectureWikiToc";
import { ArchitectureWikiChat } from "./ArchitectureWikiChat";

export { getGithubFileUrl };

export interface ArchitectureWikiProps {
  repositoryId: string | null;
  data: ArchDocData;
  repoName?: string;
  versions: ArchDocVersionSummary[];
  activeVersion: ArchDocVersionSummary | null;
  selectedVersion: number;
  onVersionChange: (version: number) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function ArchitectureWiki({
  repositoryId,
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
    () => buildMarkdownComponents(activeSection, repoName, data.commitSha),
    [activeSection, repoName, data.commitSha]
  );

  const processedMarkdown = useMemo(
    () =>
      currentSection
        ? preprocessMarkdownFileLinks(currentSection.contentMd, repoName, data.commitSha)
        : "",
    [currentSection, repoName, data.commitSha]
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

  return (
    <div className="flex h-full flex-col text-foreground">
      {/* ── App header ── */}
      <ArchitectureWikiHeader
        shortSha={shortSha}
        verificationScore={data.verificationScore}
        generatedAt={data.generatedAt}
        versions={versions}
        activeVersion={activeVersion}
        selectedVersion={selectedVersion}
        latestVersion={latestVersion}
        onVersionChange={onVersionChange}
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
      />

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
        <ArchitectureWikiSidebar
          sections={data.sections}
          activeSection={activeSection}
          activeHeading={activeHeading}
          sidebarOpen={sidebarOpen}
          onSectionSelect={setActiveSection}
          onHeadingSelect={scrollToHeading}
        />

        {/* ── Main Content (Scrolls independently) ── */}
        <main
          ref={contentRef}
          className="flex-1 h-full overflow-y-auto no-scrollbar"
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
                  {processedMarkdown}
                </ReactMarkdown>
              </article>

              {/* Dependency Graph */}
              {currentSection.diagramMermaid && (
                <DependencyGraphPanel diagram={currentSection.diagramMermaid} />
              )}

              {/* Source files */}
              <SourceFilesPanel
                files={currentSection.sourceFiles}
                repoName={repoName}
                commitSha={data.commitSha}
              />
            </div>
          )}
        </main>

        {/* ── Right TOC ── */}
        <ArchitectureWikiToc
          headings={tocHeadings}
          activeHeading={activeHeading}
          onHeadingSelect={scrollToHeading}
        />
      </div>

      {/* ── Bottom Chat Bar ── */}
      <ArchitectureWikiChat
        repoName={repoName}
        repositoryId={repositoryId}
        messages={messages}
        isStreaming={isStreaming}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatExpanded={chatExpanded}
        setChatExpanded={setChatExpanded}
        onSendMessage={handleSendMessage}
        chatScrollRef={chatScrollRef}
      />
    </div>
  );
}
