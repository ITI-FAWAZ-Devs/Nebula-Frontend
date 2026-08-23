"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoVariant = "full" | "small" | "icon" | "auto";
export type LogoColor = "default" | "white";
export type LogoSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface LogoProps {
  variant?: LogoVariant;
  color?: LogoColor;
  white?: boolean;
  size?: LogoSize | number;
  href?: string | null;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  alt?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => void;
  iconOnly?: boolean;
  showBadge?: boolean;
  showSubtext?: boolean;
}

const LOGO_METADATA = {
  full: {
    default: { src: "/full.png", width: 707, height: 353, aspect: 2.0 },
    white: { src: "/full.png", width: 707, height: 353, aspect: 2.0 },
  },
  small: {
    default: { src: "/small.png", width: 500, height: 500, aspect: 1.0 },
    white: { src: "/small.png", width: 500, height: 500, aspect: 1.0 },
  },
};

const HEIGHT_PRESETS: Record<LogoSize, number> = {
  sm: 26,
  md: 38,
  lg: 50,
  xl: 100,
  "2xl": 140,
};

/**
 * Backward-compatible SVG Nebula mark
 */
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
      <path
        d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z"
        fill="url(#nebula-mark-grad)"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export function Logo({
  variant = "full",
  color = "white",
  white,
  size = "md",
  href = "/",
  className,
  imageClassName,
  priority = true,
  alt = "Nebula OS",
  onClick,
  iconOnly,
  showBadge,
  showSubtext,
}: LogoProps) {
  // Resolve color (defaults to 'white')
  const activeColor: LogoColor = white !== undefined ? (white ? "white" : "default") : color;

  // Resolve variant with backwards compatibility
  const resolvedVariant: LogoVariant = iconOnly ? "small" : variant;

  // Resolve height
  const heightInPx =
    typeof size === "number" ? size : HEIGHT_PRESETS[size] || HEIGHT_PRESETS.md;

  const renderLogoImage = (type: "full" | "small", extraClass?: string) => {
    const meta = LOGO_METADATA[type][activeColor];
    const computedWidth = Math.round(heightInPx * meta.aspect);

    return (
      <Image
        src={meta.src}
        alt={alt}
        width={computedWidth}
        height={heightInPx}
        priority={priority}
        style={{ height: `${heightInPx}px`, width: "auto" }}
        className={cn(
          "object-contain shrink-0 transition-opacity duration-200",
          imageClassName,
          extraClass
        )}
      />
    );
  };

  const renderContent = () => {
    if (resolvedVariant === "auto") {
      return (
        <div
          onClick={onClick}
          className={cn("inline-flex items-center shrink-0 select-none", className)}
        >
          {renderLogoImage("small", "block sm:hidden")}
          {renderLogoImage("full", "hidden sm:block")}
        </div>
      );
    }

    if (resolvedVariant === "icon" || resolvedVariant === "small") {
      return (
        <div
          onClick={onClick}
          className={cn("inline-flex items-center shrink-0 select-none", className)}
        >
          {renderLogoImage("small")}
        </div>
      );
    }

    return (
      <div
        onClick={onClick}
        className={cn(
          "inline-flex select-none shrink-0",
          showSubtext ? "flex-col items-center justify-center gap-1" : "items-center gap-2",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {renderLogoImage("full")}
          {showBadge && (
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-primary shrink-0">
              OS
            </span>
          )}
        </div>
        {showSubtext && (
          <span className="font-mono text-[10px] text-white/45 tracking-widest uppercase font-medium shrink-0 mt-0.5 text-center">
            AI Command Center
          </span>
        )}
      </div>
    );
  };

  const content = renderContent();

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "inline-flex items-center shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl transition-transform hover:opacity-95 active:scale-[0.98]",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Convenience component specifically for the Small / Mark Logo
 */
export function LogoSmall(props: Omit<LogoProps, "variant">) {
  return <Logo {...props} variant="small" />;
}

/**
 * Convenience component specifically for the Full Logo
 */
export function LogoFull(props: Omit<LogoProps, "variant">) {
  return <Logo {...props} variant="full" />;
}

