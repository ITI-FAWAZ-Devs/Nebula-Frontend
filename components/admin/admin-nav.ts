import {
  Bot,
  FileText,
  FolderGit2,
  LayoutDashboard,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Platform-wide overview and key metrics.",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts, roles, and platform access.",
  },
  {
    title: "Repositories",
    href: "/admin/repositories",
    icon: FolderGit2,
    description: "Inspect all repositories across the platform.",
  },
  {
    title: "Documentation Jobs",
    href: "/admin/documentation-jobs",
    icon: FileText,
    description: "Monitor documentation generation jobs and history.",
  },
  {
    title: "AI / Q&A",
    href: "/admin/ai-qa",
    icon: Bot,
    description: "Review AI interactions and question history.",
  },
  {
    title: "Activity Logs",
    href: "/admin/activity-logs",
    icon: ScrollText,
    description: "Audit trail of administrative actions.",
  },
];

export function isAdminNavActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

export function getAdminNavTitle(pathname: string): string {
  const current = adminNavItems.find((item) =>
    isAdminNavActive(item.href, pathname)
  );
  return current?.title ?? "Admin";
}
