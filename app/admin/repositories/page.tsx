import type { Metadata } from "next";
import { AdminRepositories } from "@/components/admin/repositories/AdminRepositories";

export const metadata: Metadata = {
  title: "Admin — Repositories",
  description: "Inspect all repositories across the platform.",
};

export default function AdminRepositoriesPage() {
  return <AdminRepositories />;
}
