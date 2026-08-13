import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { AdminPagePlaceholder } from "@/components/admin/AdminPagePlaceholder";

export const metadata: Metadata = {
  title: "Admin — Activity Logs",
  description: "Audit trail of administrative actions.",
};

export default function AdminActivityLogsPage() {
  return (
    <AdminPagePlaceholder
      title="Activity Logs"
      description="Audit trail of administrative actions and platform events."
      icon={ScrollText}
    />
  );
}
