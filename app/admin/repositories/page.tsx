import type { Metadata } from "next";
import { FolderGit2 } from "lucide-react";
import { AdminPagePlaceholder } from "@/components/admin/AdminPagePlaceholder";

export const metadata: Metadata = {
  title: "Admin — Repositories",
  description: "Inspect all repositories across the platform.",
};

export default function AdminRepositoriesPage() {
  return (
    <AdminPagePlaceholder
      title="Repositories"
      description="Inspect all repositories across the platform, their status, and documentation coverage."
      icon={FolderGit2}
    />
  );
}
