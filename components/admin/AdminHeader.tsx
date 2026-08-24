"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Home, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useLogoutMutation } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAdminNavTitle } from "./admin-nav";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-white/8 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1 text-white/60 hover:text-white" />

      <Separator
        orientation="vertical"
        className="data-vertical:h-5! mr-2 data-[orientation=vertical]:self-center"
      />

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <h1 className="truncate font-display text-sm font-semibold tracking-tight text-white">
          {getAdminNavTitle(pathname)}
        </h1>
      </div>

      {/* Admin profile */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 pl-0.5 outline-none transition-colors border border-transparent hover:border-white/15 hover:bg-white/3 focus-visible:border-white/15 focus-visible:bg-white/3 data-[popup-open]:border-white/15 data-[popup-open]:bg-white/3">
          <Avatar size="sm">
            <AvatarImage src={user?.avatar || undefined} alt={user?.fullName || "Admin"} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
              {(user?.fullName || user?.email || "A").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-36 truncate pr-1.5 text-xs font-medium text-white/80 sm:block">
            {user?.fullName || "Admin"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-panel border border-white/10 bg-popover/90 p-1 text-white backdrop-blur">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-xs">
              <p className="truncate font-semibold text-white">
                {user?.fullName || "Admin"}
              </p>
              <p className="truncate font-mono text-[10px] font-normal text-white/50">
                {user?.email}
              </p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="hover:bg-white/5 text-white/80 focus:bg-white/5 cursor-pointer rounded-md">
            <Link href="/" className="flex items-center gap-2 w-full">
              <Home className="h-3.5 w-3.5" /> Back to app
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-white/5 text-white/80 focus:bg-white/5 cursor-pointer rounded-md">
            <Link href="/settings" className="flex items-center gap-2 w-full">
              <Settings className="h-3.5 w-3.5" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer rounded-md"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
