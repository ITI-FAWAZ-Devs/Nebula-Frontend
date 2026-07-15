"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useState } from "react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Successfully logged in!");
      router.replace(redirectUrl);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: "github" | "google") => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    // Construct final callback URL
    const targetUrl = `${backendUrl}/auth/${provider}`;
    window.location.href = targetUrl;
  };

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
        {/* Logo/Branding Header */}
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

        {/* Auth Glass Panel Card */}
        <div className="glass-panel p-8 w-full">
          <h2 className="text-lg font-semibold text-white/90 mb-1">
            Welcome back
          </h2>
          <p className="text-xs text-white/55 mb-6">
            Log in to manage your repositories and active agents.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">
                <FieldTitle className="text-white/70">Email Address</FieldTitle>
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
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            {/* Password Field */}
            <Field data-invalid={!!errors.password}>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel htmlFor="password">
                  <FieldTitle className="text-white/70">Password</FieldTitle>
                </FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
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
              className="w-full inline-flex h-9 items-center justify-center rounded-full mt-6 text-xs font-semibold text-primary-foreground"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.14 210), oklch(0.72 0.18 265))",
                boxShadow: "0 4px 16px -4px oklch(0.72 0.18 265 / 0.6)",
              }}
            >
              {isSubmitting ? "Authenticating..." : "Log In"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-transparent px-3 text-[10px] text-white/30 uppercase tracking-widest bg-[oklch(0.09_0.02_265)]">
              or continue with
            </span>
          </div>

          {/* Social Sign-in Buttons */}
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
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
