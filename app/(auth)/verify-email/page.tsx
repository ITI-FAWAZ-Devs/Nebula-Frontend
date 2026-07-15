"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmailMutation();
  const token = searchParams.get("token");
  const runOnce = useRef(false);

  useEffect(() => {
    if (runOnce.current) return;
    if (token) {
      runOnce.current = true;
      verifyEmailMutation.mutate({ token });
    }
  }, [token, verifyEmailMutation]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background nebula-bg px-4 py-12">
      {/* Background glow orb */}
      <div
        className="absolute h-[50vmin] w-[50vmin] rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.72 0.18 265 / 0.25), oklch(0.65 0.22 300 / 0.12) 50%, transparent 80%)",
          filter: "blur(45px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="h-10 w-10 rounded-full mb-3"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, white, oklch(0.72 0.18 265) 60%, oklch(0.4 0.15 285))",
              boxShadow: "0 0 16px oklch(0.72 0.18 265 / 0.8)",
            }}
          />
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Nebula <span className="text-gradient">OS</span>
          </h1>
          <p className="text-sm text-white/50 mt-1.5 font-mono tracking-wide uppercase text-[10px]">
            AI SOFTWARE COMMAND CENTER
          </p>
        </div>

        {/* Card Component */}
        <div className="glass-panel p-8 w-full min-h-[260px] flex flex-col justify-center text-center">
          {!token ? (
            <div>
              <div className="flex justify-center mb-5">
                <FiAlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Verification Token Missing
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6">
                We couldn't locate a verification token in the URL. Please click the full link in your verification email.
              </p>
              <div className="border-t border-white/5 pt-5">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-xs font-semibold text-white/85 border border-white/10 bg-white/3 hover:bg-white/8 transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : verifyEmailMutation.isPending ? (
            <div className="py-4">
              <div className="relative flex items-center justify-center h-16 mb-4">
                <motion.div
                  className="absolute h-10 w-10 rounded-full border border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute h-14 w-14 rounded-full border border-dashed border-nebula-cyan/20 animate-spin-reverse-slow"
                />
                <div className="h-4 w-4 rounded-full bg-white glow-blue animate-ping" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">
                Verifying Email
              </h2>
              <p className="text-xs text-white/50 font-mono tracking-wide uppercase text-[10px]">
                Securing account connection...
              </p>
            </div>
          ) : verifyEmailMutation.isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <div className="flex justify-center mb-5">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-nebula-cyan/10 text-nebula-cyan border border-nebula-cyan/30 animate-bounce"
                  style={{ boxShadow: "0 0 20px oklch(0.82 0.14 210 / 0.3)" }}
                >
                  <FiCheckCircle className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
                Your email address has been verified successfully. Your command center is ready.
              </p>
              <div className="border-t border-white/5 pt-6">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-primary-foreground text-xs font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.82 0.14 210), oklch(0.72 0.18 265))",
                    boxShadow: "0 4px 16px -4px oklch(0.72 0.18 265 / 0.6)",
                  }}
                >
                  Log In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <div className="flex justify-center mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-destructive/10 text-destructive border border-destructive/20">
                  <FiAlertCircle className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
                {(verifyEmailMutation.error as any)?.response?.data?.message ||
                  verifyEmailMutation.error?.message ||
                  "Invalid or expired verification token."}
              </p>
              <div className="border-t border-white/5 pt-6">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-xs font-semibold text-white/85 border border-white/10 bg-white/3 hover:bg-white/8 transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
