interface SectionEyebrowProps {
  children: React.ReactNode;
}

export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-primary/80">
      {children}
    </div>
  );
}
