import { GitBranch, FileCode2, Binary, Network, Cpu, Database, Bot } from "lucide-react";
import { Step, Agent } from "./types";

export const STEPS: Step[] = [
  { id: "clone", label: "Cloning repository", detail: "Fetching refs and objects", icon: GitBranch, duration: 1600,
    logs: ["remote: enumerating objects…", "receiving objects: 100% (18,342/18,342)", "resolving deltas: 100%"] },
  { id: "parse", label: "Parsing source code", detail: "Tokenizing 1,284 files", icon: FileCode2, duration: 1800,
    logs: ["lexer online · 12 languages", "parsed src/**/*.ts → 842 files", "parsed src/**/*.py → 214 files"] },
  { id: "ast", label: "Building AST", detail: "Constructing 92k nodes", icon: Binary, duration: 1500,
    logs: ["symbol table hydrated", "cross-file references linked", "type inference: pass 2/2"] },
  { id: "graph", label: "Creating dependency graph", detail: "Mapping 3,410 edges", icon: Network, duration: 1700,
    logs: ["module boundaries detected: 42", "cyclic dependencies: 0", "graph density: 0.14"] },
  { id: "embed", label: "Generating embeddings", detail: "Vectorizing semantic units", icon: Cpu, duration: 2000,
    logs: ["embed model: nebula-e3-large", "chunks: 6,204 · 1536-dim", "index built · ANN recall 0.98"] },
  { id: "rag", label: "Initializing RAG", detail: "Building retrieval indices", icon: Database, duration: 1400,
    logs: ["hybrid search enabled", "reranker warmed", "context window: 200k tokens"] },
  { id: "agents", label: "Launching AI agents", detail: "Bringing constellation online", icon: Bot, duration: 1800,
    logs: ["architect · online", "documentarian · online", "sentinel · online", "cartographer · online"] },
];

export const AGENTS: Agent[] = [
  { name: "Architect", role: "Maps system topology", color: "#4493F8" },
  { name: "Documentarian", role: "Keeps docs alive", color: "#4493F8" },
  { name: "Sentinel", role: "Watches for regressions", color: "#F48C50" },
  { name: "Cartographer", role: "Charts the galaxy", color: "#4493F8" },
];
