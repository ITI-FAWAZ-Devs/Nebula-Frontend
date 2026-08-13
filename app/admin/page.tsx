import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { AdminPagePlaceholder } from "@/components/admin/AdminPagePlaceholder";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform-wide overview and key metrics.",
};

export default function AdminDashboardPage() {
  return (
    <AdminPagePlaceholder
      title="Dashboard"
      description="Platform-wide overview and key metrics will appear here."
      icon={LayoutDashboard}
    />
  );
}
