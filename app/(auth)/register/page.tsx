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
import { AuthCard } from "@/components/auth/AuthCard";
import { FiGithub, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";
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
  const [showPassword, setShowPassword] = useState(false);

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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  return (
    <AuthCard>
      {!isRegistered ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Create an account
            </h2>
            <p className="text-xs text-white/55 mt-1 leading-relaxed">
              Connect your codebase and boot up your command center.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">
                <FieldTitle className="text-white/80 text-xs font-medium">Full Name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-3.5 h-4 w-4 text-white/35 pointer-events-none" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="bg-black/40 border-white/12 text-white placeholder:text-white/20 pl-10 h-10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                    {...register("fullName")}
                  />
                </div>
              </FieldContent>
              {errors.fullName && (
                <FieldError className="text-[11px] text-red-400 mt-1">{errors.fullName.message}</FieldError>
              )}
            </Field>

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

            {/* Password Field */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">
                <FieldTitle className="text-white/80 text-xs font-medium">Password</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 h-4 w-4 text-white/35 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
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
              <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
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

          {/* Social Buttons */}
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

          <p className="text-center text-xs text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Log in
            </Link>
          </p>
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
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/30 shadow-[0_0_30px_rgba(68,147,248,0.3)]"
            >
              <FiCheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Verify your email
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm mx-auto">
            We've sent a verification link to <span className="text-primary font-mono font-semibold">{registeredEmail}</span>.
            Please click the link inside that email to activate your command center.
          </p>
          <div className="border-t border-white/10 pt-6">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-6 text-xs font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Proceed to Login
            </Link>
          </div>
        </motion.div>
      )}
    </AuthCard>
  );
}
