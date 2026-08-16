"use client";

import { ProtectedGuard } from "@/components/auth/ProtectedGuard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedGuard requireRole="ADMIN">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-background">
          <AdminHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedGuard>
  );
}
