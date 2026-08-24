import {
  Users,
  Shield,
  FolderGit2,
  Database,
  Link2,
  ClipboardList,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export type OrgTab =
  | "members"
  | "roles"
  | "repositories"
  | "teams"
  | "connections"
  | "audit"
  | "settings";

export type OrgNavItem = {
  id: OrgTab;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const ORG_NAV: OrgNavItem[] = [
  {
    id: "members",
    label: "Members",
    description: "Invite and manage people in this organization.",
    icon: Users,
  },
  {
    id: "roles",
    label: "Roles",
    description: "Configure permission roles for your organization.",
    icon: Shield,
  },
  {
    id: "repositories",
    label: "Org Repos",
    description: "Repositories scoped to this organization.",
    icon: FolderGit2,
  },
  // {
  //   id: "teams",
  //   label: "Teams",
  //   description: "Group members and assign repository access.",
  //   icon: Database,
  // },
  {
    id: "connections",
    label: "Connections",
    description: "Manage GitHub connections for this organization.",
    icon: Link2,
  },
  {
    id: "audit",
    label: "Audit",
    description: "Review recent organization activity.",
    icon: ClipboardList,
  },
  {
    id: "settings",
    label: "Org Settings",
    description: "Rename, billing, and danger zone.",
    icon: Settings2,
  },
];

export const VALID_ORG_TABS = new Set<OrgTab>(ORG_NAV.map((t) => t.id));

export function orgTabHref(orgId: string, tab: OrgTab) {
  return `/organizations?org=${orgId}&tab=${tab}`;
}
