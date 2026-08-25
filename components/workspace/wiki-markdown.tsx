import React from "react";
import { FileText } from "lucide-react";
import { EditorCodeBlock } from "@/components/workspace/EditorCodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";
import { slugify } from "./wiki-helpers";

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (!children) return "";
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (typeof children === "object" && "props" in children && (children as any).props?.children) {
    return extractTextFromChildren((children as any).props.children);
  }
  return String(children);
}

function renderTableCellContent(children: React.ReactNode): React.ReactNode {
  const text = extractTextFromChildren(children).trim();

  // Highlight HTTP methods
  const methodUpper = text.toUpperCase();
  if (["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(methodUpper)) {
    const badgeColors: Record<string, string> = {
      GET: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
      POST: "bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.15)]",
      PUT: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.15)]",
      PATCH: "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
      DELETE: "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.15)]",
      OPTIONS: "bg-purple-500/15 border-purple-500/30 text-purple-400",
      HEAD: "bg-slate-500/15 border-slate-500/30 text-slate-300",
    };
    return (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide ${
          badgeColors[methodUpper] || "bg-white/10 border-white/20 text-white"
        }`}
      >
        {methodUpper}
      </span>
    );
  }

  // Format endpoint paths (e.g. /users, /api/v1/auth)
  if (text.startsWith("/") && !text.includes(" ") && text.length > 1) {
    return (
      <span className="font-mono text-xs font-medium text-sky-300/90 bg-sky-500/5 px-1.5 py-0.5 rounded border border-sky-500/10">
        {children}
      </span>
    );
  }

  return children;
}

export function buildMarkdownComponents(
  sectionKey: string,
  repoName: string,
  commitSha?: string | null
) {
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
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4
        id={slugify(String(children))}
        className="scroll-mt-24 text-sm font-display font-medium text-white/70 mb-2 mt-4"
      >
        {children}
      </h4>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="space-y-1.5 mb-4 ml-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-outside space-y-1.5 mb-4 ml-5 text-sm text-muted-foreground leading-relaxed">
        {children}
      </ol>
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
    del: ({ children }: { children?: React.ReactNode }) => (
      <del className="text-muted-foreground/50 line-through">{children}</del>
    ),
    hr: () => <hr className="my-6 border-white/10" />,
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      const isGithub = href?.includes("github.com") || href?.includes("/blob/");
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:text-sky-300 no-underline transition-colors"
        >
          {isGithub && <FileText className="h-3 w-3 text-primary shrink-0" />}
          {children}
        </a>
      );
    },
    code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
      const isMermaid = className === "language-mermaid";
      const rawCode = extractTextFromChildren(children).replace(/\n$/, "");
      const isBlock = className?.includes("language-") || rawCode.includes("\n");
      
      if (isMermaid) {
        return <MermaidDiagram chart={rawCode} />;
      }
      if (isBlock) {
        const lang = className?.replace("language-", "") || "typescript";
        return <EditorCodeBlock code={rawCode} language={lang} />;
      }
      return (
        <code className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-primary/90">
          {children}
        </code>
      );
    },
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-primary/40 pl-4 my-4 text-sm text-muted-foreground italic bg-primary/[0.02] py-1 rounded-r">
        {children}
      </blockquote>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-6 w-full overflow-x-auto rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-xs shadow-md">
        <table className="w-full min-w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="border-b border-white/10 bg-white/[0.04]">
        {children}
      </thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="divide-y divide-white/5">
        {children}
      </tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="transition-colors hover:bg-white/[0.02]">
        {children}
      </tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-3 text-sm text-white/80 align-middle">
        {renderTableCellContent(children)}
      </td>
    ),
  };
}

export const chatMdComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  a: ({ children, href }: any) => (
    <a href={href} className="text-primary no-underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  code: ({ children, className }: any) => {
    const isMermaid = className === "language-mermaid";
    const rawCode = extractTextFromChildren(children).replace(/\n$/, "");
    const isBlock = className?.includes("language-") || rawCode.includes("\n");

    if (isMermaid) {
      return <MermaidDiagram chart={rawCode} />;
    }

    if (isBlock) {
      const lang = className?.replace("language-", "") || "typescript";
      return <EditorCodeBlock code={rawCode} language={lang} />;
    }
    return (
      <code className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-primary/90">
        {children}
      </code>
    );
  },
  ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  table: ({ children }: any) => (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-white/10 bg-slate-900/60 shadow-md">
      <table className="w-full min-w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="border-b border-white/10 bg-white/[0.04]">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-white/5">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="transition-colors hover:bg-white/[0.02]">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/70">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2.5 text-xs text-white/80 align-middle">
      {renderTableCellContent(children)}
    </td>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-xs text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-white/10" />,
};

