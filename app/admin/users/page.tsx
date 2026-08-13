import type { Metadata } from "next";
import { Users } from "lucide-react";
import { AdminPagePlaceholder } from "@/components/admin/AdminPagePlaceholder";

export const metadata: Metadata = {
  title: "Admin — Users",
  description: "Manage user accounts, roles, and platform access.",
};

export default function AdminUsersPage() {
  return (
    <AdminPagePlaceholder
      title="Users"
      description="Manage user accounts, roles, and platform access."
      icon={Users}
    />
  );
}
