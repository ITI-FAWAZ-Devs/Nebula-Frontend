"use client";

import { NebulaBackdrop } from "@/components/landing/NebulaBackdrop";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <NebulaBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-2">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Documentation moved to the workspace
        </div>
      </div>
    </div>
  );
}
