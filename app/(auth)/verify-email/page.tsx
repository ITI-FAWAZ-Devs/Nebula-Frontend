"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { AuthCard } from "@/components/auth/AuthCard";

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
    <AuthCard>
      {!token ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <FiAlertCircle className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Token Missing
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6">
            We couldn't locate a verification token in the URL. Please click the full link in your verification email.
          </p>
          <div className="border-t border-white/10 pt-6">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-6 text-xs font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : verifyEmailMutation.isPending ? (
        <div className="py-6 text-center">
          <div className="relative flex items-center justify-center h-20 mb-6">
            <motion.div
              className="absolute h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_20px_rgba(68,147,248,0.8)] animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">
            Verifying Email
          </h2>
          <p className="text-xs text-white/50 font-mono tracking-wider uppercase">
            Securing account connection...
          </p>
        </div>
      ) : verifyEmailMutation.isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-4 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-[0_0_30px_rgba(68,147,248,0.3)]">
              <FiCheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
            Your email address has been verified successfully. Your command center is ready to launch.
          </p>
          <div className="border-t border-white/10 pt-6">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-8 text-xs font-semibold text-white shadow-[0_4px_20px_rgba(68,147,248,0.35)] hover:scale-[1.02] transition-transform"
              style={{
                background: "linear-gradient(135deg, #4493F8 0%, #6366F1 100%)",
              }}
            >
              Log In to Workspace
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-4 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <FiAlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Verification Failed
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
            {(verifyEmailMutation.error as any)?.response?.data?.message ||
              verifyEmailMutation.error?.message ||
              "Invalid or expired verification token."}
          </p>
          <div className="border-t border-white/10 pt-6">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-6 text-xs font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </motion.div>
      )}
    </AuthCard>
  );
}
