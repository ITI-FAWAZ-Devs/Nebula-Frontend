"use client";

import { motion } from "motion/react";
import { FiGithub } from "react-icons/fi";
import { Button } from "../ui/button";
import Link from "next/link";

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-40 "
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 mt-3 pill card-soft backdrop-blur rounded-full overflow-x-auto">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, white, oklch(0.72 0.18 265) 60%, oklch(0.4 0.15 285))",
              boxShadow: "0 0 12px oklch(0.72 0.18 265 / 0.9)",
            }}
          />
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            Nebula
          </Link>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <Link className="transition-colors hover:text-white" href="/#product">Product</Link>
          <Link className="transition-colors hover:text-white" href="/#agents">Agents</Link>
          <Link className="transition-colors hover:text-white" href="/docs">Docs</Link>
          <Link className="transition-colors hover:text-white" href="/pricing">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link className="hidden text-sm text-white/70 transition-colors hover:text-white sm:block" href="#">
            Sign in
          </Link>
          <Button
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.14 210), oklch(0.72 0.18 265))",
              boxShadow: "0 6px 24px -8px oklch(0.72 0.18 265 / 0.9)",
            }}
          >
            <FiGithub className="h-3.5 w-3.5" /> Launch
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
