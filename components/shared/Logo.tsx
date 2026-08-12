"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  showSubtext?: boolean;
  href?: string;
  iconOnly?: boolean;
  className?: string;
}

export function NebulaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full text-white", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nebula-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      
      {/* Clean Starburst Nebula Icon */}
      <path
        d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z"
        fill="url(#nebula-mark-grad)"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export function Logo({
  size = "md",
  showBadge = false,
  showSubtext = false,
  href = "/",
  iconOnly = false,
  className,
}: LogoProps) {
  const sizeClasses = {
    sm: {
      box: "h-7 w-7 rounded-lg p-1.5",
      text: "text-base",
      badge: "text-[9px] px-1.5 py-0.5",
      subtext: "text-[9px]",
      gap: "gap-2",
    },
    md: {
      box: "h-8.5 w-8.5 rounded-xl p-2",
      text: "text-lg",
      badge: "text-[10px] px-2 py-0.5",
      subtext: "text-[10px]",
      gap: "gap-2.5",
    },
    lg: {
      box: "h-11 w-11 rounded-2xl p-2.5",
      text: "text-2xl",
      badge: "text-xs px-2.5 py-0.5",
      subtext: "text-xs",
      gap: "gap-3",
    },
    xl: {
      box: "h-14 w-14 rounded-2xl p-3",
      text: "text-3xl",
      badge: "text-xs px-2.5 py-1",
      subtext: "text-xs",
      gap: "gap-3.5",
    },
  };

  const currentSize = sizeClasses[size];

  const content = (
    <div className={cn("inline-flex items-center select-none", currentSize.gap, className)}>
      {/* Icon Emblem Container */}
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-violet-600/30 via-indigo-600/30 to-blue-600/30 border border-white/20 shadow-md",
          currentSize.box
        )}
      >
        <NebulaMark />
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={cn("font-display font-bold tracking-tight text-white", currentSize.text)}>
              Nebula
            </span>
            {showBadge && (
              <span
                className={cn(
                  "font-mono font-semibold rounded-full bg-white/10 border border-white/15 text-primary",
                  currentSize.badge
                )}
              >
                OS
              </span>
            )}
          </div>
          {showSubtext && (
            <span className={cn("font-mono text-white/50 tracking-wider uppercase font-medium mt-0.5", currentSize.subtext)}>
              AI Software Command Center
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
