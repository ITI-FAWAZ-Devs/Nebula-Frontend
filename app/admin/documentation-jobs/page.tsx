import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { AdminPagePlaceholder } from "@/components/admin/AdminPagePlaceholder";

export const metadata: Metadata = {
  title: "Admin — Documentation Jobs",
  description: "Monitor documentation generation jobs and history.",
};

export default function AdminDocumentationJobsPage() {
  return (
    <AdminPagePlaceholder
      title="Documentation Jobs"
      description="Monitor documentation generation jobs, progress, and history across the platform."
      icon={FileText}
    />
  );
}
