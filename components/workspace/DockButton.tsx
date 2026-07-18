"use client";

interface DockButtonProps {
  icon: any;
  label: string;
  hotkey?: string;
  onClick: () => void;
}

export function DockButton({ icon: Icon, label, hotkey, onClick }: DockButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground cursor-pointer"
    >
      <Icon className="h-4 w-4" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{label}</span>
      {hotkey && <kbd className="ml-1 rounded border border-white/10 bg-white/5 px-1 font-mono text-[9px]">{hotkey}</kbd>}
    </button>
  );
}
