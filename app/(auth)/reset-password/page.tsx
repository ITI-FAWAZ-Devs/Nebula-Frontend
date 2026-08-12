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
import { AuthCard } from "@/components/auth/AuthCard";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "motion/react";
import { FiLock, FiEye, FiEyeOff, FiAlertTriangle, FiCheckCircle, FiArrowRight } from "react-icons/fi";

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
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <AuthCard>
      {!token ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <FiAlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Missing Reset Token
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6">
            The password reset token is invalid or has expired. Please request a new reset link.
          </p>
          <div className="border-t border-white/10 pt-6">
            <Link
              href="/forgot-password"
              className="inline-flex h-10 items-center justify-center rounded-xl px-6 text-xs font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      ) : !isSuccess ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Reset password
            </h2>
            <p className="text-xs text-white/55 mt-1 leading-relaxed">
              Enter and confirm your new secure account password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">
                <FieldTitle className="text-white/80 text-xs font-medium">New Password</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 h-4 w-4 text-white/35 pointer-events-none" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="bg-black/40 border-white/12 text-white placeholder:text-white/20 pl-10 pr-10 h-10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-white/35 hover:text-white/70 transition-colors p-1"
                  >
                    {showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </FieldContent>
              {errors.newPassword && (
                <FieldError className="text-[11px] text-red-400 mt-1">{errors.newPassword.message}</FieldError>
              )}
            </Field>

            {/* Confirm Password Field */}
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                <FieldTitle className="text-white/80 text-xs font-medium">Confirm Password</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 h-4 w-4 text-white/35 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="bg-black/40 border-white/12 text-white placeholder:text-white/20 pl-10 pr-10 h-10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-white/35 hover:text-white/70 transition-colors p-1"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </FieldContent>
              {errors.confirmPassword && (
                <FieldError className="text-[11px] text-red-400 mt-1">{errors.confirmPassword.message}</FieldError>
              )}
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full inline-flex h-10 items-center justify-center rounded-xl mt-6 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.01] shadow-[0_4px_20px_rgba(68,147,248,0.35)] hover:shadow-[0_6px_28px_rgba(68,147,248,0.55)] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #4493F8 0%, #6366F1 100%)",
              }}
            >
              <span>{isSubmitting ? "Resetting Password..." : "Reset Password"}</span>
              {!isSubmitting && (
                <FiArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-[0_0_30px_rgba(68,147,248,0.3)]">
              <FiCheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Password updated
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
            Your password has been successfully updated. You can now log in securely using your new credentials.
          </p>
          <div className="border-t border-white/10 pt-6">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-8 text-xs font-semibold text-white shadow-[0_4px_20px_rgba(68,147,248,0.35)] hover:scale-[1.02] transition-transform"
              style={{
                background: "linear-gradient(135deg, #4493F8 0%, #6366F1 100%)",
              }}
            >
              Proceed to Login
            </Link>
          </div>
        </motion.div>
      )}
    </AuthCard>
  );
}
