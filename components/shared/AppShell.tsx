"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, useUiStore, useWorkspaceStore } from "@/lib/store";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { ImportRepoPicker } from "@/components/launch/ImportRepoPicker";
import { CreateOrgModal } from "@/components/organizations/CreateOrgModal";
import { Nav } from "@/components/landing/Nav";
import { orgTabHref } from "@/lib/org-nav";

const APP_PREFIXES = [
  "/launch",
  "/settings",
  "/organizations",
  "/analysis",
  "/docs",
  "/voice",
  "/github",
];

function isAppRoute(pathname: string) {
  return APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function CreateOrgHost() {
  const router = useRouter();
  const createOrgOpen = useUiStore((s) => s.createOrgOpen);
  const setCreateOrgOpen = useUiStore((s) => s.setCreateOrgOpen);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  return (
    <CreateOrgModal
      open={createOrgOpen}
      onOpenChange={setCreateOrgOpen}
      onCreated={(org) => {
        setWorkspace({
          type: "organization",
          organizationId: org.id,
          organizationName: org.name,
        });
        router.push(orgTabHref(org.id, "members"));
      }}
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const importPickerOpen = useUiStore((s) => s.importPickerOpen);
  const setImportPickerOpen = useUiStore((s) => s.setImportPickerOpen);

  const isWorkspace =
    pathname === "/workspace" || pathname.startsWith("/workspace/");
  const showSidebar = !!user && !isWorkspace && isAppRoute(pathname);

  if (showSidebar) {
    return (
      <>
        <AppSidebar />
        <div className="min-h-screen md:pl-60">{children}</div>
        <ImportRepoPicker
          open={importPickerOpen}
          onOpenChange={setImportPickerOpen}
        />
        <CreateOrgHost />
      </>
    );
  }

  return (
    <>
      {!isWorkspace && <Nav />}
      {children}
      {user && <CreateOrgHost />}
    </>
  );
}
