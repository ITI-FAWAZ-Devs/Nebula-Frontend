"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useResetPasswordMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiLock } from "react-icons/fi";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid session or missing token.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The link may have expired.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background nebula-bg px-4 py-12">
      {/* Background glow orb */}
      <div
        className="absolute h-[50vmin] w-[50vmin] rounded-full opacity-30 pointer-events-none"
        style={{
          background: "#4493F8",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="h-10 w-10 rounded-full mb-3"
            style={{
              background: "#4493F8",
              boxShadow: "0 0 20px #4493F8cc",
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
        <div className="glass-panel p-8 w-full min-h-[280px] flex flex-col justify-center">
          {!token ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl bg-destructive/10 text-destructive border border-destructive/20"
                >
                  ⚠️
                </div>
              </div>
              <h2 className="text-lg font-semibold text-white/90 mb-2">
                Missing Reset Token
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6">
                The password reset token is invalid or has expired. Please request a new reset link.
              </p>
              <div className="border-t border-white/5 pt-6">
                <Link
                  href="/forgot-password"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-xs font-semibold text-white/85 border border-white/10 bg-white/3 hover:bg-white/8 transition-colors"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          ) : !isSuccess ? (
            <>
              <h2 className="text-lg font-semibold text-white/90 mb-1">
                Reset password
              </h2>
              <p className="text-xs text-white/55 mb-6">
                Enter and confirm your new secure account password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password Field */}
                <Field data-invalid={!!errors.newPassword}>
                  <FieldLabel htmlFor="newPassword">
                    <FieldTitle className="text-white/70">
                      New Password
                    </FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Minimum 8 characters"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                      {...register("newPassword")}
                    />
                  </FieldContent>
                  {errors.newPassword && (
                    <FieldError>{errors.newPassword.message}</FieldError>
                  )}
                </Field>

                {/* Confirm Password Field */}
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">
                    <FieldTitle className="text-white/70">
                      Confirm Password
                    </FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                      {...register("confirmPassword")}
                    />
                  </FieldContent>
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex h-9 items-center justify-center rounded-full mt-6 text-xs font-semibold text-white"
                  style={{
                    background: "#4493F8",
                    boxShadow: "0 4px 16px -4px #4493F899",
                  }}
                >
                  {isSubmitting ? "Resetting password..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              {/* Success Lock Icon */}
              <div className="flex justify-center mb-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl bg-primary/10 text-primary border border-primary/20"
                  style={{ boxShadow: "0 0 20px #4493F840" }}
                >
                  <FiLock className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Password updated
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
                Your password has been successfully updated. You can now log in securely using your new credentials.
              </p>
              <div className="border-t border-white/5 pt-6">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-white text-xs font-semibold"
                  style={{
                    background: "#4493F8",
                  }}
                >
                  Log In
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
