import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform-wide overview and key metrics.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
