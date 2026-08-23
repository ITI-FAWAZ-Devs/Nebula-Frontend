"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useLogoutMutation } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { adminNavItems, isAdminNavActive } from "./admin-nav";

export function AdminSidebar() {
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
    <Sidebar collapsible="icon" className="border-white/8">
      <SidebarHeader className="group-data-[collapsible=icon]:px-1.5 px-3 py-3">
        <div className="group-data-[collapsible=icon]:hidden">
          <Logo variant="full" size="lg" href="/admin" />
        </div>
        <div className="group-data-[collapsible=icon]:block hidden">
          <Logo variant="small" size="md" href="/admin" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            {adminNavItems.map((item) => {
              const isActive = isAdminNavActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      isActive &&
                        "data-[active=true]:bg-primary/10! data-[active=true]:text-primary!"
                    )}
                  >
                    <Icon
                      className={cn(
                        "text-white/50 transition-colors",
                        isActive && "text-primary",
                        !isActive && "group-hover/button:text-white"
                      )}
                    />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/8 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg p-2 text-left outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground">
                <Avatar size="sm" className="shrink-0">
                  <AvatarImage
                    src={user?.avatar || undefined}
                    alt={user?.fullName || "Admin"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {(user?.fullName || user?.email || "A").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {user?.fullName || "Admin"}
                  </span>
                  <span className="truncate font-mono text-[10px] text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass-panel border border-white/10 bg-popover/90 p-1 text-white backdrop-blur">
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
                <DropdownMenuItem
                  className="hover:bg-white/5 text-white/80 focus:bg-white/5 cursor-pointer rounded-md"
                >
                  <Link href="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer rounded-md"
                >
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
