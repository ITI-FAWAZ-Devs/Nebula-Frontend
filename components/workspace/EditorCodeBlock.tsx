"use client";

import { useState } from "react";
import { Check, Copy, FileCode, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

// ─── Tokenizer Helper ─────────────────────────────────────────────────────────

interface Token {
  text: string;
  type:
    | "keyword"
    | "string"
    | "comment"
    | "number"
    | "function"
    | "type"
    | "operator"
    | "command"
    | "plain";
}

export function tokenizeLine(line: string, lang: string): Token[] {
  const isBash = lang === "bash" || lang === "sh" || lang === "shell" || line.trim().startsWith("$");

  if (isBash) {
    const tokens: Token[] = [];
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      return [{ text: line, type: "comment" }];
    }
    // Tokenize bash line
    const bashRegex = /(\$\s*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b(?:npm|npx|node|git|cd|yarn|pnpm|docker|nest|jest|eslint|prettier)\b)|(-{1,2}[a-zA-Z0-9_-]+)|([^\s"'$]+)/g;
    let match;
    let lastIndex = 0;
    while ((match = bashRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
      }
      if (match[1]) {
        tokens.push({ text: match[1], type: "operator" });
      } else if (match[2]) {
        tokens.push({ text: match[2], type: "string" });
      } else if (match[3]) {
        tokens.push({ text: match[3], type: "command" });
      } else if (match[4]) {
        tokens.push({ text: match[4], type: "keyword" });
      } else {
        tokens.push({ text: match[5], type: "plain" });
      }
      lastIndex = bashRegex.lastIndex;
    }
    if (lastIndex < line.length) {
      tokens.push({ text: line.slice(lastIndex), type: "plain" });
    }
    return tokens;
  }

  // JS/TS/JSON Code Tokenizer
  const tokens: Token[] = [];
  const regex = /(\/\/.+$|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:import|export|from|const|let|var|function|async|await|return|if|else|for|while|switch|case|break|new|try|catch|throw|class|extends|interface|type|default|typeof|instanceof|as|in|of|void|null|undefined|true|false)\b)|(\b[A-Z][a-zA-Z0-9_$]*\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|(\b\d+(?:\.\d+)?\b)|(=>|={1,3}|!==?|&&|\|\||\?|\:|\+|\-|\*|\/|%|\.\.\.)/g;

  let match;
  let lastIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
    }
    if (match[1]) {
      tokens.push({ text: match[1], type: "comment" });
    } else if (match[2]) {
      tokens.push({ text: match[2], type: "string" });
    } else if (match[3]) {
      tokens.push({ text: match[3], type: "keyword" });
    } else if (match[4]) {
      tokens.push({ text: match[4], type: "type" });
    } else if (match[5]) {
      tokens.push({ text: match[5], type: "function" });
    } else if (match[6]) {
      tokens.push({ text: match[6], type: "number" });
    } else if (match[7]) {
      tokens.push({ text: match[7], type: "operator" });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: "plain" });
  }

  return tokens;
}

export function renderToken(token: Token, key: number) {
  switch (token.type) {
    case "keyword":
      return <span key={key} className="text-purple-400 font-medium">{token.text}</span>;
    case "string":
      return <span key={key} className="text-emerald-300">{token.text}</span>;
    case "comment":
      return <span key={key} className="text-slate-500 italic">{token.text}</span>;
    case "number":
      return <span key={key} className="text-amber-400">{token.text}</span>;
    case "function":
      return <span key={key} className="text-sky-300">{token.text}</span>;
    case "type":
      return <span key={key} className="text-yellow-300/90 font-medium">{token.text}</span>;
    case "operator":
      return <span key={key} className="text-rose-400/90">{token.text}</span>;
    case "command":
      return <span key={key} className="text-cyan-300 font-semibold">{token.text}</span>;
    default:
      return <span key={key} className="text-slate-200">{token.text}</span>;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EditorCodeBlock({ code, language = "typescript", filename }: EditorCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanCode = code.trim();
  const rawLines = cleanCode.split("\n");
  const lines = rawLines.map((l) => l.replace(/^\$\s*/, ""));
  const copyableCode = lines.join("\n");

  const normLang = (language || "").toLowerCase().replace("language-", "");

  const displayFilename = filename || (normLang ? `${normLang}` : "code");
  const isTerminal = normLang === "bash" || normLang === "sh" || normLang === "shell";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyableCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#0a0d14] shadow-2xl shadow-black/40">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/3 px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] opacity-80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] opacity-80" />
          </div>
          <span className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/70">
            {isTerminal ? (
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            ) : (
              <FileCode className="h-3.5 w-3.5 text-primary/70" />
            )}
            <span>{displayFilename}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {normLang && (
            <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40 border border-white/5">
              {normLang}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Editor Canvas ── */}
      <div className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed select-text no-scrollbar">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const tokens = tokenizeLine(line, normLang);
              return (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="w-8 shrink-0 pr-4 text-right font-mono text-[11px] text-white/20 select-none border-r border-white/5">
                    {idx + 1}
                  </td>
                  <td className="pl-4 whitespace-pre">
                    {tokens.map((token, tIdx) => renderToken(token, tIdx))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
