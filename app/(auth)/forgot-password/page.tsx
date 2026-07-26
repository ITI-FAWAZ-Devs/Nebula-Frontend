"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "motion/react";
import { FiMail } from "react-icons/fi";

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
          {!isSent ? (
            <>
              <h2 className="text-lg font-semibold text-white/90 mb-1">
                Forgot password?
              </h2>
              <p className="text-xs text-white/55 mb-6">
                Enter your email address and we'll send you a password reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">
                    <FieldTitle className="text-white/70">
                      Email Address
                    </FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                      {...register("email")}
                    />
                  </FieldContent>
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
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
                  {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              {/* Mail Icon Animation */}
              <div className="flex justify-center mb-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-xl bg-primary/10 text-primary border border-primary/20"
                  style={{ boxShadow: "0 0 20px #4493F840" }}
                >
                  <FiMail className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Check your email
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
                If an account exists for <span className="text-primary font-mono">{targetEmail}</span>, 
                we've sent a secure password reset link to your inbox.
              </p>
              <div className="border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Try a different email
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-6">
          Back to{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
