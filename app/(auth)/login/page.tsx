"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginMutation } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { AuthCard } from "@/components/auth/AuthCard";
import { FiGithub, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
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
  const loginMutation = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      router.replace("/launch");
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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const targetUrl = `${backendUrl}/auth/${provider}`;
    window.location.href = targetUrl;
  };

  return (
    <AuthCard>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs text-white/55 mt-1 leading-relaxed">
          Log in to manage your repositories, teams, and AI agents.
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
          {errors.email && <FieldError className="text-[11px] text-red-400 mt-1">{errors.email.message}</FieldError>}
        </Field>

        {/* Password Field */}
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center justify-between mb-1">
            <FieldLabel htmlFor="password">
              <FieldTitle className="text-white/80 text-xs font-medium">Password</FieldTitle>
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <FieldContent>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 h-4 w-4 text-white/35 pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-black/40 border-white/12 text-white placeholder:text-white/20 pl-10 pr-10 h-10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-white/35 hover:text-white/70 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </FieldContent>
          {errors.password && (
            <FieldError className="text-[11px] text-red-400 mt-1">{errors.password.message}</FieldError>
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
          <span>{isSubmitting ? "Authenticating..." : "Log In"}</span>
          {!isSubmitting && (
            <FiArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </form>

      {/* Separator */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <span className="relative bg-[#0C1017] px-3 text-[10px] text-white/40 uppercase tracking-widest font-mono">
          or continue with
        </span>
      </div>

      {/* Social Sign-in Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin("github")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/4 text-xs font-semibold text-white/90 hover:bg-white/8 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <FiGithub className="h-4 w-4" />
          GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin("google")}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/4 text-xs font-semibold text-white/90 hover:bg-white/8 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <FcGoogle className="h-4 w-4" />
          Google
        </Button>
      </div>

      {/* Footer link */}
      <p className="text-center text-xs text-white/40 mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
