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
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";

const MARKETING_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#product" },
  { label: "Use cases", href: "/#agents" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/#cta" },
  { label: "Changelog", href: "/#timeline" },
];

/** Marketing / landing navbar. App routes use AppSidebar via AppShell. */
export function Nav() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Successfully logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed.");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-40"
    >
      <div className="mx-auto mt-3 flex max-w-360 items-center justify-between overflow-x-auto rounded-full border border-white/8 bg-[#0B0E14]/70 px-5 backdrop-blur-xl">
        <Logo variant="auto" size="lg" href="/" />
        <nav className="hidden items-center gap-0.5 text-sm text-white/55 lg:flex">
          {MARKETING_LINKS.map((link) => (
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
              {/* <WorkspaceSwitcher /> */}
              <Link
                className="text-sm text-white/60 transition-colors hover:text-white"
                href="/launch"
              >
                Open app
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 p-0.5 outline-none transition-colors hover:border-white/20 hover:bg-white/3">
                  <Avatar size="sm">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.fullName || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {(user.fullName || user.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mt-1 w-56 glass-panel border border-white/10 bg-popover/90 p-1 text-white backdrop-blur"
                >
                  <div className="px-2 py-1.5">
                    <p className="truncate text-xs font-semibold">
                      {user.fullName || "User"}
                    </p>
                    <p className="truncate font-mono text-[10px] text-white/50">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="cursor-pointer rounded-md text-white/80 hover:bg-white/5 focus:bg-white/5">
                    <Link href="/launch" className="flex w-full items-center">
                      Repositories
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-md text-white/80 hover:bg-white/5 focus:bg-white/5">
                    <Link href="/settings" className="flex w-full items-center">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-md text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
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
                  className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5"
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
