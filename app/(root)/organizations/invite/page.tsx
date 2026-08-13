"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Building2, CheckCircle, AlertTriangle, Loader2, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcceptOrgInviteMutation } from "@/hooks/use-organization";
import { useRegisterFromInviteMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface QuickRegisterForm {
  fullName: string;
  password: string;
  confirmPassword: string;
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const acceptMutation = useAcceptOrgInviteMutation();
  const registerFromInvite = useRegisterFromInviteMutation();

  const [accepted, setAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuickRegisterForm>();

  const handleAccept = async () => {
    if (!token) return;
    try {
      await acceptMutation.mutateAsync(token);
      toast.success("Invitation accepted successfully!");
      setAccepted(true);
      setTimeout(() => router.push("/organizations"), 2000);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(msg || "Failed to accept invitation.");
    }
  };

  const onQuickRegister = async (data: QuickRegisterForm) => {
    if (!token) return;
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await registerFromInvite.mutateAsync({
        inviteToken: token,
        fullName: data.fullName,
        password: data.password,
      });
      toast.success("Account created! You've been added to the organization.");
      setAccepted(true);
      setTimeout(() => router.push("/organizations"), 2000);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(msg || "Failed to complete registration.");
    }
  };

  if (!token) {
    return (
      <div className="glass-panel p-8 max-w-md w-full text-center border-white/10 shadow-[0_0_60px_-10px_rgba(68,147,248,0.2)]">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">Invalid Invitation Link</h2>
          <p className="text-xs text-white/50">
            No invitation token was supplied in the URL. Please check the link in your email.
          </p>
          <Button onClick={() => router.push("/organizations")} className="mt-4 text-xs font-mono" variant="ghost">
            Go to Organizations
          </Button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="glass-panel p-8 max-w-md w-full text-center border-white/10 shadow-[0_0_60px_-10px_rgba(68,147,248,0.2)]">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">Welcome to the Workspace!</h2>
          <p className="text-xs text-white/60 font-mono">
            {isLoggedIn ? "Invitation accepted." : "Account created."} Redirecting to the organization dashboard...
          </p>
          <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto mt-2" />
        </div>
      </div>
    );
  }

  /* ── Logged-in: one-click accept ── */
  if (isLoggedIn) {
    return (
      <div className="glass-panel p-8 max-w-md w-full text-center border-white/10 shadow-[0_0_60px_-10px_rgba(68,147,248,0.2)]">
        <div className="space-y-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-2">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">Organization Invitation</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            You have been invited to join a Nebula organization. Click below to accept the invitation and gain access to shared repositories, docs, and custom roles.
          </p>
          <div className="pt-4">
            <Button
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              className="w-full h-10 font-mono text-xs uppercase tracking-wider text-white rounded-xl cursor-pointer"
              style={{ background: "#4493F8" }}
            >
              {acceptMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating Token...</>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Accept Invitation <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not logged in: quick-register form ── */
  return (
    <div className="glass-panel p-8 max-w-md w-full border-white/10 shadow-[0_0_60px_-10px_rgba(68,147,248,0.2)]">
      <div className="text-center mb-6">
        <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
          <KeyRound className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-white">Set Up Your Account</h2>
        <p className="text-xs text-white/50 mt-2 leading-relaxed">
          You&apos;ve been invited to a Nebula organization. Set a name and password to join instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onQuickRegister)} className="space-y-4">
        <div>
          <label className="text-xs font-mono text-white/60 block mb-1.5">Full Name</label>
          <Input
            {...register("fullName", { required: "Full name is required" })}
            placeholder="Jane Smith"
            className={cn(
              "bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm h-10",
              errors.fullName && "border-rose-500/50",
            )}
          />
          {errors.fullName && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-mono text-white/60 block mb-1.5">Password</label>
          <Input
            type="password"
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
            placeholder="Min. 8 characters"
            className={cn(
              "bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm h-10",
              errors.password && "border-rose-500/50",
            )}
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-mono text-white/60 block mb-1.5">Confirm Password</label>
          <Input
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })}
            placeholder="Repeat password"
            className={cn(
              "bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm h-10",
              errors.confirmPassword && "border-rose-500/50",
            )}
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 mt-2 font-mono text-xs uppercase tracking-wider text-white rounded-xl cursor-pointer"
          style={{ background: "#4493F8" }}
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account & Join <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <p className="text-center text-[11px] text-white/30 font-mono pt-1">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push(`/login?redirect=/organizations/invite?token=${token}`)}
            className="text-primary hover:underline cursor-pointer"
          >
            Log in instead
          </button>
        </p>
      </form>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-background nebula-bg flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-primary" />}>
        <AcceptInviteContent />
      </Suspense>
    </div>
  );
}
