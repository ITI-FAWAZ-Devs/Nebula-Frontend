import type { Metadata } from "next";
import { AdminDocumentationJobs } from "@/components/admin/documentation-jobs/AdminDocumentationJobs";

export const metadata: Metadata = {
  title: "Admin — Documentation Jobs",
  description: "Monitor documentation generation jobs and history.",
};

export default function AdminDocumentationJobsPage() {
  return <AdminDocumentationJobs />;
}
