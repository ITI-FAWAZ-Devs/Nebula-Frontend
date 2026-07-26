import { Planet } from "./types";

export const PLANETS: Planet[] = [
  { id: "core", name: "orion-core", kind: "Runtime", x: 50, y: 50, r: 46, color: "#4493F8", deps: ["api", "db", "ml"], files: 842, loc: "184k", desc: "The distributed edge runtime powering every request across the platform." },
  { id: "ui", name: "quasar-ui", kind: "Design System", x: 22, y: 30, r: 26, color: "#4493F8", deps: ["core"], files: 214, loc: "62k", desc: "Composable primitives and tokens shared across all product surfaces." },
  { id: "api", name: "pulsar-api", kind: "Gateway", x: 78, y: 28, r: 30, color: "#4493F8", deps: ["core", "db"], files: 318, loc: "94k", desc: "GraphQL federation with realtime subscriptions and edge caching." },
  { id: "ml", name: "helios-ml", kind: "Inference", x: 80, y: 72, r: 34, color: "#F48C50", deps: ["core", "db"], files: 502, loc: "128k", desc: "Multimodal inference pipeline: retrieval, reranking, generation." },
  { id: "cli", name: "vega-cli", kind: "Developer", x: 18, y: 74, r: 22, color: "#4493F8", deps: ["api"], files: 96, loc: "22k", desc: "The command-line surface into every corner of the platform." },
  { id: "db", name: "andromeda-db", kind: "Storage", x: 50, y: 88, r: 28, color: "#4493F8", deps: [], files: 264, loc: "76k", desc: "Vector + relational store with hybrid retrieval and RAG primitives." },
];
