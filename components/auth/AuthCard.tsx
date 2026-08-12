"use client";

import React from "react";
import { NebulaMark } from "@/components/shared/Logo";
import Link from "next/link";

interface AuthCardProps {
  children: React.ReactNode;
  subtitle?: string;
  maxWidth?: string;
}

export function AuthCard({ children, maxWidth = "max-w-[440px]" }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#07090E] px-4 py-12 overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* High-tech Constellation Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Static Soft Background Orbs */}
      <div
        className="absolute -top-[15%] left-[20%] h-[50vmin] w-[50vmin] rounded-full pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(68,147,248,0.1) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute -bottom-[15%] right-[20%] h-[50vmin] w-[50vmin] rounded-full pointer-events-none opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
          filter: "blur(75px)",
        }}
      />

      {/* Main Container */}
      <div className={`relative z-10 w-full ${maxWidth}`}>
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-3 group outline-none">
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_24px_rgba(99,102,241,0.45)]">
              <NebulaMark className="h-6 w-6" />
            </div> */}
            <div>
              <div className="font-display text-2xl font-bold tracking-tight text-white">
                Nebula <span className="text-gradient">OS</span>
              </div>
              <p className="text-[10px] font-mono text-white/45 tracking-widest uppercase mt-0.5">
                AI Software Command Center
              </p>
            </div>
          </Link>
        </div>

        {/* Auth Glass Card Panel */}
        <div className="relative rounded-3xl border border-white/12 bg-[#0C1017]/85 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {children}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-white/35 mt-8 font-mono">
          Protected by Nebula OS Neural Encryption
        </p>
      </div>
    </div>
  );
}
