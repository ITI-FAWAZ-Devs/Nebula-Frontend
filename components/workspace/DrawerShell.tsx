"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface DrawerShellProps {
  side: "left" | "right" | "bottom" | "center";
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  label: string;
}

export function DrawerShell({ side, open, onClose, children, width = "min(560px, 92vw)", label }: DrawerShellProps) {
  const initial =
    side === "right" ? { x: "100%", opacity: 0 } :
    side === "left" ? { x: "-100%", opacity: 0 } :
    side === "bottom" ? { y: "100%", opacity: 0 } :
    { scale: 0.95, opacity: 0, y: -20 };
  const animate = side === "center" ? { scale: 1, opacity: 1, y: 0 } : { x: 0, y: 0, opacity: 1 };

  const position =
    side === "right" ? "top-0 right-0 h-full" :
    side === "left" ? "top-0 left-0 h-full" :
    side === "bottom" ? "left-1/2 bottom-6 -translate-x-1/2" :
    "left-1/2 top-24 -translate-x-1/2";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-background/40 backdrop-blur-[2px]" 
            onClick={onClose} 
          />
          <motion.aside
            initial={initial as any} 
            animate={animate as any} 
            exit={initial as any}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={`fixed z-40 ${position}`}
            style={{ width }}
            aria-label={label}
          >
            <div className="premium-panel relative flex h-full max-h-[85vh] flex-col overflow-hidden">
              <button 
                onClick={onClose} 
                className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
