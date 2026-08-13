"use client";

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
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const { data: orgs } = useOrganizationsQuery();

  const currentLabel =
    workspace.type === "personal"
      ? "Personal"
      : orgs?.find((o: { id: string; name: string }) => o.id === workspace.organizationId)?.name ?? "Organization";

  const currentIcon =
    workspace.type === "personal" ? (
      <UserCircle2 className="h-3.5 w-3.5 text-blue-400" />
    ) : (
      <Building2 className="h-3.5 w-3.5 text-purple-400" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors outline-none">
        {currentIcon}
        <span className="max-w-[100px] truncate">{currentLabel}</span>
        <ChevronDown className="h-3 w-3 text-white/30" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-52 glass-panel border border-white/10 bg-popover/90 backdrop-blur p-1 text-white"
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
            onClick={() => setWorkspace({ type: "personal" })}
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
                    onClick={() =>
                      setWorkspace({
                        type: "organization",
                        organizationId: org.id,
                        organizationName: org.name,
                      })
                    }
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
