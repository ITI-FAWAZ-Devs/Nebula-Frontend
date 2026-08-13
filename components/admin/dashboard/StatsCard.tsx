import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const accentStyles = {
  blue: "border-primary/20 bg-primary/10 text-primary",
  cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
} as const;

export type StatsCardAccent = keyof typeof accentStyles;

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: StatsCardAccent;
  footer?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  accent = "blue",
  footer,
}: StatsCardProps) {
  return (
    <div className="glass-panel flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {title}
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-white tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
            accentStyles[accent]
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      {footer ? (
        <div className="text-xs text-muted-foreground">{footer}</div>
      ) : null}
    </div>
  );
}

export interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export function MiniStat({ label, value, color }: MiniStatProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <span className="truncate font-display text-base font-semibold text-white tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
        {color ? (
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : null}
        {label}
      </span>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="glass-panel flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
