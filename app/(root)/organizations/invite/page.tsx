"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Building2, CheckCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { ProtectedGuard } from "@/components/auth/ProtectedGuard";
import { Button } from "@/components/ui/button";
import { useAcceptOrgInviteMutation } from "@/hooks/use-organization";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const acceptMutation = useAcceptOrgInviteMutation();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!token) return;

    try {
      await acceptMutation.mutateAsync(token);
      toast.success("Invitation accepted successfully!");
      setAccepted(true);
      setTimeout(() => {
        router.push("/organizations");
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to accept invitation.";
      toast.error(msg);
    }
  };

  return (
    <div className="glass-panel p-8 max-w-md w-full text-center border-white/10 shadow-[0_0_60px_-10px_rgba(68,147,248,0.2)]">
      {!token ? (
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">Invalid Invitation Link</h2>
          <p className="text-xs text-white/50">
            No invitation token was supplied in the URL. Please check the link in your email.
          </p>
          <Button
            onClick={() => router.push("/organizations")}
            className="mt-4 text-xs font-mono"
            variant="ghost"
          >
            Go to Organizations
          </Button>
        </div>
      ) : accepted ? (
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-white">Welcome to the Workspace!</h2>
          <p className="text-xs text-white/60 font-mono">
            Your invitation has been validated. Redirecting you to the organization dashboard...
          </p>
          <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto mt-2" />
        </div>
      ) : (
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating Token...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Accept Invitation <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background nebula-bg flex items-center justify-center p-4">
        <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-primary" />}>
          <AcceptInviteContent />
        </Suspense>
      </div>
    </ProtectedGuard>
  );
}
