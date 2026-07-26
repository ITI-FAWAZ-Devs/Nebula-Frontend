"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { GitBranch, Rocket, Circle, Eye, Trash2, Loader2 } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { Repository } from "@/hooks/use-repository";

interface RepoCardProps {
  repo: Repository;
  index: number;
  onLaunch: (r: Repository) => void;
  onDeleteClick: (r: Repository) => void;
  onDetailClick: (r: Repository) => void;
}

export function RepoCard({
  repo,
  index,
  onLaunch,
  onDeleteClick,
  onDetailClick,
}: RepoCardProps) {
  const [hover, setHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { margin: "50px" });

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "READY":
        return { color: "#10b981", label: "Ready", glow: "shadow-[0_0_10px_#10b981]" };
      case "FAILED":
        return { color: "#ef4444", label: "Failed", glow: "shadow-[0_0_10px_#ef4444]" };
      case "CLONING":
        return { color: "#22d3ee", label: "Cloning", glow: "shadow-[0_0_10px_#22d3ee]" };
      case "INDEXING":
        return { color: "#a855f7", label: "Indexing", glow: "shadow-[0_0_10px_#a855f7]" };
      default:
        return { color: "#94a3b8", label: "Imported", glow: "" };
    }
  };

  const statusInfo = getStatusDetails(repo.status);
  const isPending = repo.status === "CLONING" || repo.status === "INDEXING";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="group relative"
    >
      <div 
        className={`premium-panel relative overflow-hidden p-6 transition-all duration-500 group-hover:border-white/20 ${!inView ? "pause-animations" : ""}`}
        style={{ 
          transform: hover ? "translateY(-4px)" : "none", 
          boxShadow: hover ? "0 30px 80px -20px #4493F840" : undefined 
        }}
      >
        {/* orbit ring behind */}
        <motion.div
          aria-hidden
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_20px_#4493F8]" />
        </motion.div>

        {/* Action icons top right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetailClick(repo);
            }}
            className="flex h-7 w-7 items-center justify-center rounded bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 text-muted-foreground hover:text-white transition cursor-pointer"
            title="Inspect Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(repo);
            }}
            className="flex h-7 w-7 items-center justify-center rounded bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/25 text-rose-400 hover:text-rose-300 transition cursor-pointer"
            title="Remove Repository"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-start justify-between pr-14">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <FiGithub className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-mono text-xs text-muted-foreground">{repo.owner}/</div>
              <div className="font-display text-lg font-semibold leading-tight text-white">{repo.name}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <GitBranch className="h-2.5 w-2.5" /> {repo.defaultBranch}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground bg-white/3 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
            {repo.isPrivate ? "Private" : "Public"}
          </span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Codebase integrated into Nebula space control center. Ready for telemetry compilation.
        </p>

        <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            ) : (
              <Circle className="h-2 w-2 fill-current" style={{ color: statusInfo.color }} />
            )}
            <span style={{ color: statusInfo.color }} className={statusInfo.glow}>
              {statusInfo.label}
            </span>
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest">
            {new Date(repo.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <motion.button
          onClick={() => onLaunch(repo)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-primary/15 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-white transition-all hover:border-primary/40 hover:shadow-[0_0_30px_#4493F840] cursor-pointer"
          whileTap={{ scale: 0.98 }}
        >
          <Rocket className="h-3.5 w-3.5" />
          Launch to Galaxy
        </motion.button>
      </div>
    </motion.div>
  );
}
