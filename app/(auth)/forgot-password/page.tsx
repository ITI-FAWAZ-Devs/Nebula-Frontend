"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { AuthCard } from "@/components/auth/AuthCard";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "motion/react";
import { FiMail, FiArrowRight, FiArrowLeft } from "react-icons/fi";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setTargetEmail(data.email);
      setIsSent(true);
      toast.success("Password reset request sent!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send reset link.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard>
      {!isSent ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Forgot password?
            </h2>
            <p className="text-xs text-white/55 mt-1 leading-relaxed">
              Enter your registered email address and we'll send you a secure reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">
                <FieldTitle className="text-white/80 text-xs font-medium">Email Address</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 h-4 w-4 text-white/35 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="bg-black/40 border-white/12 text-white placeholder:text-white/20 pl-10 h-10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                    {...register("email")}
                  />
                </div>
              </FieldContent>
              {errors.email && (
                <FieldError className="text-[11px] text-red-400 mt-1">{errors.email.message}</FieldError>
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
              <span>{isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}</span>
              {!isSubmitting && (
                <FiArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-white/40 mt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
              <FiArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </p>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-2"
        >
          {/* Mail Icon Animation */}
          <div className="flex justify-center mb-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-[0_0_30px_rgba(68,147,248,0.3)]"
            >
              <FiMail className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Check your inbox
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
            If an account exists for <span className="text-primary font-mono font-semibold">{targetEmail}</span>, 
            we've sent a password reset link to your email address.
          </p>
          <div className="flex flex-col gap-2.5 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mt-2"
            >
              <FiArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
        </motion.div>
      )}
    </AuthCard>
  );
}
