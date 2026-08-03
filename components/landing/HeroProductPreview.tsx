"use client";

import {
  LayoutDashboard,
  MessageSquare,
  Network,
  GitBranch,
  BookOpen,
  Search,
  Settings,
  Lock,
  FileCode2,
  Folder,
  FolderOpen,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: MessageSquare, label: "Ask", active: false },
  { icon: Network, label: "Architecture", active: false },
  { icon: GitBranch, label: "Graph", active: false },
  { icon: BookOpen, label: "Docs", active: false },
  { icon: Search, label: "Search", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const graphNodes = [
  { id: "auth-ctrl", label: "AuthController", x: 28, y: 22, color: "#7C5CFC" },
  { id: "auth-svc", label: "AuthService", x: 58, y: 18, color: "#5B8DEF" },
  { id: "user", label: "User", x: 78, y: 42, color: "#A78BFA" },
  { id: "db", label: "Database", x: 48, y: 58, color: "#5EEAD4" },
  { id: "jwt", label: "JwtGuard", x: 18, y: 52, color: "#C084FC" },
  { id: "session", label: "Session", x: 68, y: 72, color: "#818CF8" },
];

const edges = [
  ["auth-ctrl", "auth-svc"],
  ["auth-svc", "user"],
  ["auth-svc", "db"],
  ["auth-ctrl", "jwt"],
  ["user", "session"],
  ["db", "session"],
];

const sources = [
  { path: "controllers/auth.controller.ts", lines: "12–48" },
  { path: "services/auth.service.ts", lines: "31–94" },
  { path: "guards/jwt.guard.ts", lines: "8–27" },
];

const files = [
  { name: "src", type: "folder", open: true, depth: 0 },
  { name: "controllers", type: "folder", open: true, depth: 1 },
  { name: "auth.controller.ts", type: "file", depth: 2, active: true },
  { name: "user.controller.ts", type: "file", depth: 2 },
  { name: "services", type: "folder", open: true, depth: 1 },
  { name: "auth.service.ts", type: "file", depth: 2 },
  { name: "user.service.ts", type: "file", depth: 2 },
  { name: "models", type: "folder", open: false, depth: 1 },
  { name: "guards", type: "folder", open: false, depth: 1 },
];

function nodeById(id: string) {
  return graphNodes.find((n) => n.id === id)!;
}

export function HeroProductPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B12]/90 shadow-[0_40px_100px_-30px_rgba(124,92,252,0.45)] backdrop-blur-xl">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-white/50">
            <Lock className="h-3 w-3" />
            acme / backend-service
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400">Synced 2m ago</span>
      </div>

      <div className="flex h-[calc(100%-40px)]">
        {/* App sidebar */}
        <aside className="hidden w-[112px] shrink-0 flex-col gap-0.5 border-r border-white/8 p-2 sm:flex">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                item.active
                  ? "bg-[#7C5CFC]/20 text-white"
                  : "text-white/40"
              }`}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </aside>

        {/* Main panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Graph */}
          <div className="relative h-[42%] min-h-[140px] border-b border-white/8 p-3">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
              Code Knowledge Graph
            </div>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                    stroke="rgba(124,92,252,0.35)"
                    strokeWidth="0.4"
                  />
                );
              })}
            </svg>
            {graphNodes.map((node) => (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div
                  className="rounded-full border px-2 py-0.5 font-mono text-[8px] whitespace-nowrap text-white/90 sm:text-[9px]"
                  style={{
                    borderColor: `${node.color}55`,
                    background: `${node.color}22`,
                    boxShadow: `0 0 12px ${node.color}33`,
                  }}
                >
                  {node.label}
                </div>
              </div>
            ))}
          </div>

          {/* Ask / answer */}
          <div className="flex-1 overflow-hidden p-3">
            <div className="mb-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[11px] text-white/70">
              How does authentication work in this repo?
            </div>
            <p className="mb-2 text-[10px] leading-relaxed text-white/45 sm:text-[11px]">
              Requests hit <span className="text-white/70">AuthController</span>, which
              delegates to <span className="text-white/70">AuthService</span>. JWT
              validation runs through <span className="text-white/70">JwtGuard</span> before
              user sessions are persisted.
            </p>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 mb-1.5">
              Sources
            </div>
            <div className="space-y-1">
              {sources.map((s) => (
                <div
                  key={s.path}
                  className="flex items-center gap-1.5 rounded-md border border-white/6 bg-white/2 px-2 py-1 font-mono text-[9px] text-[#A78BFA]"
                >
                  <FileCode2 className="h-3 w-3 shrink-0 text-white/30" />
                  <span className="truncate">{s.path}</span>
                  <span className="ml-auto shrink-0 text-white/25">{s.lines}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Files panel */}
        <aside className="hidden w-[132px] shrink-0 flex-col border-l border-white/8 p-2 md:flex">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
            Files
          </div>
          <div className="space-y-0.5 overflow-hidden">
            {files.map((f) => (
              <div
                key={`${f.depth}-${f.name}`}
                className={`flex items-center gap-1 rounded px-1 py-0.5 font-mono text-[9px] ${
                  f.active ? "bg-[#7C5CFC]/20 text-white" : "text-white/40"
                }`}
                style={{ paddingLeft: `${4 + f.depth * 8}px` }}
              >
                {f.type === "folder" ? (
                  f.open ? (
                    <FolderOpen className="h-3 w-3 shrink-0 text-[#E8B86D]/70" />
                  ) : (
                    <Folder className="h-3 w-3 shrink-0 text-[#E8B86D]/50" />
                  )
                ) : (
                  <FileCode2 className="h-3 w-3 shrink-0 text-white/25" />
                )}
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
