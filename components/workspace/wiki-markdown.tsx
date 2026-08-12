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
      <blockquote className="border-l-2 border-primary/40 pl-4 my-4 text-sm text-muted-foreground italic">
        {children}
      </blockquote>
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
