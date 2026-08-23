"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FolderGit2,
  Plus,
  Settings,
  CircleHelp,
  ChevronDown,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { useAuthStore, useUiStore, useWorkspaceStore } from "@/lib/store";
import { useLogoutMutation } from "@/hooks/use-auth";
import { WorkspaceSwitcher } from "@/components/shared/WorkspaceSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ORG_NAV, VALID_ORG_TABS, orgTabHref, type OrgTab } from "@/lib/org-nav";
import { useOrganizationsQuery } from "@/hooks/use-organization";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { workspace } = useWorkspaceStore();
  const setImportPickerOpen = useUiStore((s) => s.setImportPickerOpen);
  const logoutMutation = useLogoutMutation();

  // Detect whether the current user is Viewer/Developer in this org
  const { data: orgs } = useOrganizationsQuery();
  const READ_ONLY_ROLE_NAMES = ["Viewer", "Developer"];
  const RESTRICTED_SIDEBAR_TABS: OrgTab[] = ["members", "roles", "connections", "audit", "settings"];
  const currentOrg =
    workspace.type === "organization"
      ? orgs?.find((o) => o.id === workspace.organizationId)
      : null;
  const currentRoleName = currentOrg?.userRole?.name ?? "";
  const isOrgOwner =
    !!user && !!currentOrg && currentOrg.ownerId === user.id;
  const isRestrictedSidebarRole =
    !isOrgOwner && READ_ONLY_ROLE_NAMES.includes(currentRoleName);

  const visibleOrgNav = ORG_NAV.filter(
    (item) =>
      !isRestrictedSidebarRole || !RESTRICTED_SIDEBAR_TABS.includes(item.id)
  );

  const isOrg = workspace.type === "organization";
  const tabParam = searchParams.get("tab");
  const activeOrgTab: OrgTab | null =
    tabParam && VALID_ORG_TABS.has(tabParam as OrgTab)
      ? (tabParam as OrgTab)
      : pathname.startsWith("/organizations")
        ? "members"
        : null;
  const onOrgs = pathname.startsWith("/organizations");
  const onRepos =
    pathname.startsWith("/launch") || pathname.startsWith("/analysis");

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Successfully logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed.");
    }
  };

  const itemClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
      active
        ? "bg-white/[0.08] font-medium text-white"
        : "text-white/55 hover:bg-white/[0.04] hover:text-white/90"
    );

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/8 bg-[#070A12]/95 backdrop-blur-xl">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/8 px-4 pt-2">
        <Logo variant="full" size="lg" href="/" onClick={onNavigate} />
      </div>

      <div className="border-b border-white/8 px-3 py-3">
        <WorkspaceSwitcher variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        <div className="space-y-0.5">
          <Link
            href="/launch"
            onClick={onNavigate}
            className={itemClass(onRepos)}
          >
            <FolderGit2 className="h-4 w-4 shrink-0 opacity-80" />
            <span className="truncate">Repositories</span>
          </Link>
        </div>

        {isOrg ? (
          <div className="space-y-0.5">
            <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-white/35">
              Organization
            </div>
            {visibleOrgNav.map((item) => {
              const Icon = item.icon;
              const active = onOrgs && activeOrgTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={orgTabHref(workspace.organizationId, item.id)}
                  onClick={onNavigate}
                  className={itemClass(active)}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-white/35">
              Workspace
            </div>
            <Link
              href="/organizations"
              onClick={onNavigate}
              className={itemClass(onOrgs)}
            >
              <Building2 className="h-4 w-4 shrink-0 opacity-80" />
              <span className="truncate">Organizations</span>
            </Link>
          </div>
        )}
      </nav>

      {!isRestrictedSidebarRole && (
        <div className="border-t border-white/8 px-2.5 py-3">
          <button
            type="button"
            onClick={() => {
              setImportPickerOpen(true);
              onNavigate?.();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-white/55 transition-colors hover:bg-white/4 hover:text-white/90"
          >
            <Plus className="h-4 w-4 shrink-0 opacity-80" />
            Import Repository
          </button>
        </div>
      )}

      <div className="space-y-0.5 border-t border-white/8 px-2.5 py-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={itemClass(pathname.startsWith("/settings"))}
        >
          <Settings className="h-4 w-4 shrink-0 opacity-80" />
          Settings
        </Link>
        <Link
          href="/docs"
          onClick={onNavigate}
          className={itemClass(pathname.startsWith("/docs"))}
        >
          <CircleHelp className="h-4 w-4 shrink-0 opacity-80" />
          Help
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="mt-1 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-white/70 outline-none transition-colors hover:bg-white/4 hover:text-white">
              <Avatar size="sm">
                <AvatarImage
                  src={user.avatar || undefined}
                  alt={user.fullName || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                  {(user.fullName || user.email).substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate font-medium text-white/85">
                {user.fullName || "Nebula"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/35" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-56 glass-panel border border-white/10 bg-popover/95 p-1 text-white backdrop-blur"
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
              <DropdownMenuItem className="cursor-pointer rounded-md text-xs">
                <Link href="/settings" className="flex w-full items-center">
                  Account settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-md text-xs text-destructive focus:bg-destructive/10"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-40 hidden md:block">
        <Suspense
          fallback={
            <div className="h-full w-60 border-r border-white/8 bg-[#070A12]" />
          }
        >
          <SidebarBody />
        </Suspense>
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-[#070A12]/90 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3 z-10 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <Suspense fallback={<div className="h-full w-60 bg-[#070A12]" />}>
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
