"use client";

import { usePathname } from "next/navigation";
import { useAuthStore, useUiStore } from "@/lib/store";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { ImportRepoPicker } from "@/components/launch/ImportRepoPicker";
import { Nav } from "@/components/landing/Nav";

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
      </>
    );
  }

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
