"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "motion/react";

const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: "Full name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMutation = useRegisterMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerMutation.mutateAsync(data);
      setRegisteredEmail(data.email);
      setIsRegistered(true);
      toast.success("Registration successful!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred during registration.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: "github" | "google") => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    window.location.href = `${backendUrl}/auth/${provider}`;
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
        <div className="glass-panel p-8 w-full min-h-[380px] flex flex-col justify-center">
          {!isRegistered ? (
            <>
              <h2 className="text-lg font-semibold text-white/90 mb-1">
                Create an account
              </h2>
              <p className="text-xs text-white/55 mb-6">
                Connect your codebase and boot up your command center.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name Field */}
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">
                    <FieldTitle className="text-white/70">Full Name</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                      {...register("fullName")}
                    />
                  </FieldContent>
                  {errors.fullName && (
                    <FieldError>{errors.fullName.message}</FieldError>
                  )}
                </Field>

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

                {/* Password Field */}
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">
                    <FieldTitle className="text-white/70">Password</FieldTitle>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                      {...register("password")}
                    />
                  </FieldContent>
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
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
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Separator */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative bg-transparent px-3 text-[10px] text-white/30 uppercase tracking-widest bg-background">
                  or continue with
                </span>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("github")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/3 text-xs font-semibold text-white/80 hover:bg-white/8 hover:text-white transition-colors"
                >
                  <FiGithub className="h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("google")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/3 text-xs font-semibold text-white/80 hover:bg-white/8 hover:text-white transition-colors"
                >
                  <FcGoogle className="h-4 w-4" />
                  Google
                </Button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              {/* Success Checkmark Anim */}
              <div className="flex justify-center mb-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-primary/10 text-primary border border-primary/30"
                  style={{ boxShadow: "0 0 20px #4493F840" }}
                >
                  ✓
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Verify your email
              </h2>
              <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
                We've sent a verification link to <span className="text-primary font-mono">{registeredEmail}</span>.
                Please click the link inside that email to activate your command center.
              </p>
              <div className="border-t border-white/5 pt-6">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-xs font-semibold text-white/85 border border-white/10 bg-white/3 hover:bg-white/8 transition-colors"
                >
                  Proceed to Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {!isRegistered && (
          <p className="text-center text-xs text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
