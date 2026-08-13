import type { Metadata } from "next";
import { Bot } from "lucide-react";
import { AdminPagePlaceholder } from "@/components/admin/AdminPagePlaceholder";

export const metadata: Metadata = {
  title: "Admin — AI / Q&A",
  description: "Review AI interactions and question history.",
};

export default function AdminAiQaPage() {
  return (
    <AdminPagePlaceholder
      title="AI / Q&A"
      description="Review AI interactions, question history, and model usage."
      icon={Bot}
    />
  );
}
