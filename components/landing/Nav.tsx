"use client";

import { motion } from "motion/react";
import { FiGithub } from "react-icons/fi";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useLogoutMutation } from "@/hooks/use-auth";
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
import { Hexagon } from "lucide-react";

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

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-40"
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between px-6 py-3 mt-3 pill card-soft backdrop-blur rounded-full overflow-x-auto">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <Hexagon
              className="h-7 w-7 text-primary"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: "#4493F8",
                  boxShadow: "0 0 8px #4493F8e6",
                }}
              />
            </div>
          </div>
          <Link href="/" className="font-display text-lg font-semibold text-white">
            Nebula
          </Link>
        </div>
        <nav className="hidden items-center gap-1 text-sm text-white/50 md:flex">
          {[
            { label: "Product", href: "/#product" },
            { label: "Agents", href: "/#agents" },
            { label: "Features", href: "/#features" },
            { label: "Docs", href: "/docs" },
          ].map((link) => (
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
            <div className="flex items-center gap-4">
              <Link className="transition-colors text-white/60 hover:text-white" href="/launch">Launch</Link>
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
                className="hidden rounded-full px-3 py-1.5 text-sm text-white/60 transition-colors duration-200 hover:bg-white/5 hover:text-white sm:block"
                href="/login"
              >
                Sign in
              </Link>
              <Link href="/login">
                <Button
                  className="group inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_#4493F8e6]"
                  style={{
                    background: "#4493F8",
                  }}
                >
                  <FiGithub className="h-3.5 w-3.5" /> Launch
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
