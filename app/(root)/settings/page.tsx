"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChangePasswordMutation } from "@/hooks/use-auth";
import { useAuthStore } from "@/lib/store";
import { ProtectedGuard } from "@/components/auth/ProtectedGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError, FieldTitle } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";
import { FiLock, FiUser, FiActivity } from "react-icons/fi";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long" }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const changePasswordMutation = useChangePasswordMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully!");
      reset();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to change password. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user has not loaded yet, don't flash empty layout
  if (!user) return null;

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background nebula-bg pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              System Settings
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Configure your command center identity and authentication profile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="glass-panel p-6 flex flex-col items-center text-center">
                <Avatar size="lg" className="mb-4 size-16 ring-2 ring-primary/20">
                  <AvatarImage src={user.avatar || undefined} alt={user.fullName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {(user.fullName || user.email).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-sm font-semibold text-white truncate w-full max-w-[200px]">
                  {user.fullName || "Nebula User"}
                </h3>
                <p className="text-xs text-white/40 truncate w-full max-w-[200px] font-mono mt-0.5">
                  {user.email}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-nebula-cyan/25 bg-nebula-cyan/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-nebula-cyan">
                  <span className="h-1.5 w-1.5 rounded-full bg-nebula-cyan animate-pulse" />
                  Active Session
                </div>
              </div>

              {/* Quick links / details */}
              <div className="glass-panel p-4 space-y-2.5 font-mono text-[11px] text-white/55">
                <div className="flex items-center gap-2">
                  <FiUser className="text-primary/70 size-3.5" />
                  <span>Profile Sync: Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiActivity className="text-nebula-cyan/70 size-3.5" />
                  <span>Server Status: Online</span>
                </div>
              </div>
            </div>

            {/* Forms section */}
            <div className="space-y-6">
              {/* Profile Details (Read Only) */}
              <div className="glass-panel p-6">
                <h2 className="text-sm font-semibold text-white/90 mb-4 pb-2 border-b border-white/5">
                  General Profile Info
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-white/40 uppercase tracking-wider font-mono mb-1">
                      Full Name
                    </label>
                    <div className="bg-white/3 border border-white/5 rounded-md px-3 py-2 text-xs text-white/80 select-none">
                      {user.fullName || "Not Specified"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/40 uppercase tracking-wider font-mono mb-1">
                      Registered Email Address
                    </label>
                    <div className="bg-white/3 border border-white/5 rounded-md px-3 py-2 text-xs text-white/80 select-none font-mono">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="glass-panel p-6">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <FiLock className="text-primary size-4" />
                  <h2 className="text-sm font-semibold text-white/90">
                    Change Password
                  </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Current Password */}
                  <Field data-invalid={!!errors.currentPassword}>
                    <FieldLabel htmlFor="currentPassword">
                      <FieldTitle className="text-white/70">
                        Current Password
                      </FieldTitle>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                        {...register("currentPassword")}
                      />
                    </FieldContent>
                    {errors.currentPassword && (
                      <FieldError>{errors.currentPassword.message}</FieldError>
                    )}
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* New Password */}
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
                          placeholder="Min 8 characters"
                          className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                          {...register("newPassword")}
                        />
                      </FieldContent>
                      {errors.newPassword && (
                        <FieldError>{errors.newPassword.message}</FieldError>
                      )}
                    </Field>

                    {/* Confirm Password */}
                    <Field data-invalid={!!errors.confirmNewPassword}>
                      <FieldLabel htmlFor="confirmNewPassword">
                        <FieldTitle className="text-white/70">
                          Confirm New Password
                        </FieldTitle>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          placeholder="Re-enter password"
                          className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-9"
                          {...register("confirmNewPassword")}
                        />
                      </FieldContent>
                      {errors.confirmNewPassword && (
                        <FieldError>
                          {errors.confirmNewPassword.message}
                        </FieldError>
                      )}
                    </Field>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => reset()}
                      disabled={isSubmitting}
                      className="rounded-full px-5 h-8 text-white/60 hover:text-white border border-white/5 transition-colors cursor-pointer"
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-8 items-center justify-center rounded-full px-5 text-xs font-semibold text-primary-foreground"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.82 0.14 210), oklch(0.72 0.18 265))",
                        boxShadow: "0 4px 16px -4px oklch(0.72 0.18 265 / 0.6)",
                      }}
                    >
                      {isSubmitting ? "Saving..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedGuard>
  );
}
