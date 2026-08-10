"use client";

import { useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Check,
  Cookie,
  Database,
  FileCode2,
  Folder,
  FolderOpen,
  GitBranch,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Network,
  Search,
  ServerCog,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

type NavId =
  | "overview"
  | "ask"
  | "architecture"
  | "graph"
  | "docs"
  | "search"
  | "settings";

const navItems: { id: NavId; icon: LucideIcon; label: string }[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "ask", icon: MessageSquare, label: "Ask" },
  { id: "architecture", icon: Network, label: "Architecture" },
  { id: "graph", icon: GitBranch, label: "Graph" },
  { id: "docs", icon: BookOpen, label: "Docs" },
  { id: "search", icon: Search, label: "Search" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const graphNodes: {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  icon: LucideIcon;
}[] = [
  { id: "auth-ctrl", label: "Auth", x: 20, y: 26, color: "#60A5FA", icon: Shield },
  { id: "auth-svc", label: "Service", x: 50, y: 18, color: "#A78BFA", icon: ServerCog },
  { id: "user-repo", label: "Users", x: 80, y: 28, color: "#818CF8", icon: Users },
  { id: "db", label: "DB", x: 50, y: 68, color: "#34D399", icon: Database },
  { id: "jwt", label: "JWT", x: 18, y: 70, color: "#C084FC", icon: KeyRound },
  { id: "session", label: "Session", x: 80, y: 70, color: "#38BDF8", icon: Cookie },
];

const edges = [
  ["auth-ctrl", "auth-svc"],
  ["auth-svc", "user-repo"],
  ["auth-svc", "db"],
  ["auth-ctrl", "jwt"],
  ["user-repo", "db"],
  ["user-repo", "session"],
  ["db", "session"],
];

const sources = [
  { path: "controllers/auth.controller.ts", lines: "L 45–88" },
  { path: "services/auth.service.ts", lines: "L 12–67" },
  { path: "auth/jwt.strategy.ts", lines: "L 8–34" },
];

const files = [
  { name: "src", type: "folder" as const, open: true, depth: 0 },
  { name: "controllers", type: "folder" as const, open: true, depth: 1 },
  {
    name: "auth.controller.ts",
    label: "auth.ctrl.ts",
    type: "file" as const,
    depth: 2,
    active: true,
  },
  {
    name: "user.controller.ts",
    label: "user.ctrl.ts",
    type: "file" as const,
    depth: 2,
  },
  { name: "services", type: "folder" as const, open: true, depth: 1 },
  {
    name: "auth.service.ts",
    label: "auth.svc.ts",
    type: "file" as const,
    depth: 2,
  },
  {
    name: "user.service.ts",
    label: "user.svc.ts",
    type: "file" as const,
    depth: 2,
  },
  { name: "auth", type: "folder" as const, open: false, depth: 1 },
  { name: "models", type: "folder" as const, open: false, depth: 1 },
  { name: "repositories", type: "folder" as const, open: false, depth: 1 },
  { name: "prisma", type: "folder" as const, open: false, depth: 1 },
];

const archLayers = [
  { name: "Controllers", items: "AuthController · UserController", color: "#60A5FA" },
  { name: "Services", items: "AuthService · UserService", color: "#A78BFA" },
  { name: "Security", items: "JwtStrategy · Guards", color: "#C084FC" },
  { name: "Data", items: "UserRepository · Prisma · DB", color: "#34D399" },
];

const docs = [
  { title: "Authentication Flow", meta: "Architecture · Updated 2m ago" },
  { title: "User Module", meta: "Modules · Updated 1h ago" },
  { title: "JWT Strategy", meta: "Security · Updated 3h ago" },
  { title: "API Reference", meta: "Docs · Updated yesterday" },
];

const searchHits = [
  { path: "auth.controller.ts", match: "login()", line: "L 45" },
  { path: "auth.service.ts", match: "validateUser()", line: "L 22" },
  { path: "jwt.strategy.ts", match: "validate()", line: "L 14" },
  { path: "user.repository.ts", match: "findByEmail()", line: "L 31" },
];

const settings = [
  { label: "Auto-sync on push", on: true },
  { label: "Citation previews", on: true },
  { label: "Private indexing", on: true },
  { label: "Email digests", on: false },
];

function nodeById(id: string) {
  return graphNodes.find((n) => n.id === id)!;
}

function KnowledgeGraph({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative w-full ${compact ? "h-full min-h-[160px]" : "h-full min-h-[220px]"}`}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <marker
            id="hero-arrow"
            markerWidth="4"
            markerHeight="4"
            refX="3"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L4,2 L0,4 Z" fill="rgba(167,139,250,0.55)" />
          </marker>
        </defs>
        {edges.map(([from, to]) => {
          const a = nodeById(from);
          const b = nodeById(to);
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(129,140,248,0.4)"
              strokeWidth="0.4"
              markerEnd="url(#hero-arrow)"
            />
          );
        })}
      </svg>
      {graphNodes.map((node) => (
        <div
          key={node.id}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-[#0B0E14] sm:h-9 sm:w-9"
            style={{ borderColor: `${node.color}66`, color: node.color }}
          >
            <node.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
          </div>
          <span className="whitespace-nowrap font-mono text-[8px] font-medium text-white/80 sm:text-[9px]">
            {node.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function AskPanel({ full = false }: { full?: boolean }) {
  return (
    <div className={`flex flex-col ${full ? "h-full" : ""}`}>
      <div className="mb-2 rounded-lg border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 py-2 text-[11px] text-white/80">
        How does authentication work in this repo?
      </div>
      <p className="mb-3 text-[10px] leading-relaxed text-white/50 sm:text-[11px]">
        Requests hit <span className="text-white/80">AuthController</span>, which
        delegates to <span className="text-white/80">AuthService</span>. JWT
        validation runs through <span className="text-white/80">JwtStrategy</span>{" "}
        before user data is loaded via{" "}
        <span className="text-white/80">UserRepository</span>.
      </p>
      {full && (
        <div className="mb-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px] text-white/45">
          Where are sessions persisted?
        </div>
      )}
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
        Sources
      </div>
      <div className="space-y-1.5">
        {sources.map((s) => (
          <div
            key={s.path}
            className="flex items-center gap-1.5 rounded-md border border-white/6 bg-white/[0.02] px-2 py-1.5 font-mono text-[9px] text-[#93C5FD]"
          >
            <FileCode2 className="h-3 w-3 shrink-0 text-[#60A5FA]" />
            <span className="min-w-0 flex-1 truncate">{s.path}</span>
            <span className="shrink-0 text-white/25">{s.lines}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilesPanel() {
  return (
    <aside className="hidden w-[176px] shrink-0 flex-col border-l border-white/8 p-2.5 md:flex">
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
        Files
      </div>
      <div className="mb-2 flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.03] px-2 py-1.5">
        <Search className="h-3 w-3 shrink-0 text-white/30" />
        <span className="font-mono text-[9px] text-white/30">Search files...</span>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
        {files.map((f) => (
          <div
            key={`${f.depth}-${f.name}`}
            title={f.name}
            className={`flex items-center gap-1.5 rounded-md py-1 pr-1.5 font-mono text-[9px] ${
              f.active
                ? "bg-white/[0.06] text-white ring-1 ring-inset ring-white/10"
                : "text-white/45"
            }`}
            style={{ paddingLeft: `${6 + f.depth * 10}px` }}
          >
            {f.type === "folder" ? (
              f.open ? (
                <FolderOpen className="h-3 w-3 shrink-0 text-[#E8B86D]/70" />
              ) : (
                <Folder className="h-3 w-3 shrink-0 text-[#E8B86D]/50" />
              )
            ) : (
              <FileCode2
                className={`h-3 w-3 shrink-0 ${
                  f.active ? "text-white/70" : "text-white/25"
                }`}
              />
            )}
            <span className="whitespace-nowrap">{f.label ?? f.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
      <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export function HeroProductPreview() {
  const [active, setActive] = useState<NavId>("overview");
  const showFiles = active === "overview" || active === "docs";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0E14]/95 backdrop-blur-xl">
      {/* Window chrome */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]">
            <GitBranch className="h-3 w-3 text-white" />
          </span>
          <span className="truncate font-mono text-[11px] text-white/60">
            acme / backend-service
          </span>
        </div>
        <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-emerald-400">
          <Lock className="h-3 w-3" />
          Synced 2m ago
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* App sidebar */}
        <aside className="flex w-[132px] shrink-0 flex-col gap-0.5 border-r border-white/8 p-2 sm:w-[148px]">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${
                  isActive
                    ? "bg-[#3B82F6]/20 text-white"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                <item.icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? "text-[#60A5FA]" : ""
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {active === "overview" && (
            <>
              <div className="relative min-h-[180px] flex-[1.1] border-b border-white/8 p-3">
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                  Code Knowledge Graph
                </div>
                <KnowledgeGraph compact />
              </div>
              <div className="min-h-0 flex-1 overflow-hidden p-3">
                <AskPanel />
              </div>
            </>
          )}

          {active === "ask" && (
            <PanelShell title="Ask your repo">
              <AskPanel full />
            </PanelShell>
          )}

          {active === "architecture" && (
            <PanelShell title="Architecture layers">
              <div className="space-y-2.5">
                {archLayers.map((layer, i) => (
                  <div
                    key={layer.name}
                    className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5" style={{ color: layer.color }} />
                      <span className="text-[11px] font-medium text-white/85">
                        {i + 1}. {layer.name}
                      </span>
                    </div>
                    <p className="pl-5 font-mono text-[10px] text-white/40">
                      {layer.items}
                    </p>
                  </div>
                ))}
              </div>
            </PanelShell>
          )}

          {active === "graph" && (
            <PanelShell title="Code Knowledge Graph">
              <div className="h-[min(100%,280px)]">
                <KnowledgeGraph />
              </div>
            </PanelShell>
          )}

          {active === "docs" && (
            <PanelShell title="Living documentation">
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.title}
                    className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                  >
                    <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#60A5FA]" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-white/85">
                        {doc.title}
                      </div>
                      <div className="mt-0.5 font-mono text-[9px] text-white/35">
                        {doc.meta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PanelShell>
          )}

          {active === "search" && (
            <PanelShell title="Search codebase">
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <Search className="h-3.5 w-3.5 text-[#60A5FA]" />
                <span className="text-[11px] text-white/70">authentication</span>
              </div>
              <div className="space-y-1.5">
                {searchHits.map((hit) => (
                  <div
                    key={`${hit.path}-${hit.line}`}
                    className="flex items-center gap-2 rounded-md border border-white/6 bg-white/[0.02] px-2.5 py-2"
                  >
                    <FileCode2 className="h-3.5 w-3.5 shrink-0 text-[#60A5FA]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-[10px] text-white/70">
                        {hit.path}
                      </div>
                      <div className="truncate text-[10px] text-white/35">
                        {hit.match}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[9px] text-white/25">
                      {hit.line}
                    </span>
                  </div>
                ))}
              </div>
            </PanelShell>
          )}

          {active === "settings" && (
            <PanelShell title="Repository settings">
              <div className="space-y-2">
                {settings.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      {item.label.includes("Email") ? (
                        <Bell className="h-3.5 w-3.5 text-white/40" />
                      ) : item.label.includes("Private") ? (
                        <Lock className="h-3.5 w-3.5 text-white/40" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-white/40" />
                      )}
                      <span className="text-[11px] text-white/75">{item.label}</span>
                    </div>
                    <span
                      className={`relative h-4 w-7 rounded-full ${
                        item.on ? "bg-[#3B82F6]" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                          item.on ? "left-3.5" : "left-0.5"
                        }`}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </PanelShell>
          )}
        </div>

        {showFiles && <FilesPanel />}
      </div>
    </div>
  );
}
