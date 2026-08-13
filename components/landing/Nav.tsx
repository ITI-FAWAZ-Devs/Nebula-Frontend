"use client";

import { motion } from "motion/react";
import { FiGithub } from "react-icons/fi";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useLogoutMutation } from "@/hooks/use-auth";
import { WorkspaceSwitcher } from "@/components/shared/WorkspaceSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
function NebulaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 1.6c.35 0 .64.2.78.52l2.3 5.2 5.55.5c.72.06 1.02.96.47 1.43l-4.2 3.6 1.3 5.4c.17.7-.58 1.25-1.18.88L12 16.7l-4.92 2.83c-.6.37-1.35-.18-1.18-.88l1.3-5.4-4.2-3.6c-.55-.47-.25-1.37.47-1.43l5.55-.5 2.3-5.2c.14-.32.43-.52.78-.52Z" />
    </svg>
  );
}

export function Nav() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/workspace" || pathname === "/docs") return null;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Successfully logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed.");
    }
  };

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#product" },
    { label: "Use cases", href: "/#agents" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/#cta" },
    { label: "Changelog", href: "/#timeline" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-40"
    >
      <div className="mx-auto mt-3 flex max-w-[90rem] items-center justify-between overflow-x-auto rounded-full border border-white/8 bg-[#0B0E14]/70 px-5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(99,102,241,0.45)]">
            <NebulaMark className="h-4 w-4" />
          </div>
          <Link href="/" className="font-display text-lg font-semibold text-white">
            Nebula
          </Link>
        </div>
        <nav className="hidden items-center gap-0.5 text-sm text-white/55 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              className="rounded-full px-3 py-1.5 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <WorkspaceSwitcher />
              <Link className="transition-colors text-white/60 hover:text-white text-sm" href="/launch">Launch</Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 border border-white/10 hover:border-white/20 hover:bg-white/3 transition-colors outline-none cursor-pointer">
                  <Avatar size="sm">
                    <AvatarImage src={user.avatar || undefined} alt={user.fullName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {(user.fullName || user.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-panel border border-white/10 bg-popover/90 backdrop-blur p-1 mt-1 text-white">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold truncate">{user.fullName || "User"}</p>
                    <p className="text-[10px] text-white/50 truncate font-mono">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="hover:bg-white/5 text-white/80 focus:bg-white/5 cursor-pointer rounded-md">
                    <Link href="/organizations" className="flex items-center w-full">
                      Organizations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/5 text-white/80 focus:bg-white/5 cursor-pointer rounded-md">
                    <Link href="/settings" className="flex items-center w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer rounded-md"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link
                className="hidden rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white sm:block"
                href="/login"
              >
                Sign in
              </Link>
              <Link href="/login">
                <Button
                  className="group inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(99,102,241,0.75)]"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)",
                  }}
                >
                  <FiGithub className="h-3.5 w-3.5" /> Connect GitHub
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
