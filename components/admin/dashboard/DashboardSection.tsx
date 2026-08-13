import type { LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export interface DashboardSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function DashboardSection({
  title,
  description,
  icon: Icon,
  iconClassName,
  action,
  className,
  children,
}: DashboardSectionProps) {
  return (
    <div className={cn("glass-panel flex flex-col gap-4 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80",
                iconClassName
              )}
            >
              <Icon className="size-4" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold tracking-tight text-white">
              {title}
            </h3>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export interface DashboardSectionEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function DashboardSectionEmpty({
  icon: Icon,
  title,
  description,
  className,
}: DashboardSectionEmptyProps) {
  return (
    <Empty className={cn("border-white/10 p-8", className)}>
      <EmptyMedia
        variant="icon"
        className="size-10 rounded-xl border border-white/10 bg-white/5 text-white/60 [&>svg]:size-5"
      >
        <Icon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle className="text-white">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export interface ProgressBarProps {
  label: string;
  value: number;
  color: string;
  hint?: string;
}

export function ProgressBar({ label, value, color, hint }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-xs tabular-nums text-foreground">
          {hint ?? `${clamped}%`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
