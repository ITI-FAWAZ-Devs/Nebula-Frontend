"use client";

import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store";
import { useOrganizationsQuery } from "@/hooks/use-organization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle2, Building2, ChevronDown, Check } from "lucide-react";
import { VALID_ORG_TABS, orgTabHref, type OrgTab } from "@/lib/org-nav";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  variant?: "default" | "sidebar";
}

export function WorkspaceSwitcher({ variant = "default" }: WorkspaceSwitcherProps) {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const { data: orgs } = useOrganizationsQuery();
  const pathname = usePathname();
  const router = useRouter();

  const syncOrgRoute = (organizationId: string) => {
    if (!pathname.startsWith("/organizations")) return;
    const tabParam =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("tab")
        : null;
    const tab: OrgTab =
      tabParam && VALID_ORG_TABS.has(tabParam as OrgTab)
        ? (tabParam as OrgTab)
        : "members";
    router.push(orgTabHref(organizationId, tab));
  };

  const currentLabel =
    workspace.type === "personal"
      ? "Personal"
      : orgs?.find((o: { id: string; name: string }) => o.id === workspace.organizationId)?.name ?? "Organization";

  const currentIcon =
    workspace.type === "personal" ? (
      <UserCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
    ) : (
      <Building2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-lg text-xs font-medium text-white/70 outline-none transition-colors hover:bg-white/5 hover:text-white cursor-pointer",
          variant === "sidebar"
            ? "w-full border border-white/10 bg-white/[0.03] px-2.5 py-2"
            : "px-2.5 py-1.5"
        )}
      >
        {currentIcon}
        <span
          className={cn(
            "truncate",
            variant === "sidebar" ? "flex-1 text-left max-w-none" : "max-w-[100px]"
          )}
        >
          {currentLabel}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 text-white/30" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "glass-panel border border-white/10 bg-popover/90 backdrop-blur p-1 text-white",
          variant === "sidebar" ? "w-56" : "w-52"
        )}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-widest text-white/35 font-mono">
            Workspace
          </DropdownMenuLabel>
          <DropdownMenuItem
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer",
              workspace.type === "personal"
                ? "text-white bg-white/5"
                : "text-white/70 hover:text-white hover:bg-white/5",
            )}
            onClick={() => {
              setWorkspace({ type: "personal" });
              if (pathname.startsWith("/organizations")) {
                router.push("/organizations");
              }
            }}
          >
            <UserCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="flex-1">Personal</span>
            {workspace.type === "personal" && <Check className="h-3 w-3 text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {orgs && orgs.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/8 my-1" />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-widest text-white/35 font-mono">
                Organizations
              </DropdownMenuLabel>
              {orgs.map((org: { id: string; name: string }) => {
                const isActive =
                  workspace.type === "organization" && workspace.organizationId === org.id;
                return (
                  <DropdownMenuItem
                    key={org.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer",
                      isActive ? "text-white bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5",
                    )}
                    onClick={() => {
                      setWorkspace({
                        type: "organization",
                        organizationId: org.id,
                        organizationName: org.name,
                      });
                      syncOrgRoute(org.id);
                    }}
                  >
                    <Building2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span className="flex-1 truncate">{org.name}</span>
                    {isActive && <Check className="h-3 w-3 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
