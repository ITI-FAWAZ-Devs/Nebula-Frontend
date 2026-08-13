import type { Metadata } from "next";
import { AdminUsers } from "@/components/admin/users/AdminUsers";

export const metadata: Metadata = {
  title: "Admin — Users",
  description: "Manage user accounts, roles, and platform access.",
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
